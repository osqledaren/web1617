import {Component, Inject} from '@angular/core';
import {NewsArticleService} from '../news-article.service';
import {ActivatedRoute, Router} from '@angular/router';
import {isNullOrUndefined} from 'util';
import {DOCUMENT, DomSanitizer} from '@angular/platform-browser';
import {Article} from '../article.interface';
import {ArticleQueryParams} from '../article-query-params.interface';
import {ArchiveService} from '../../archive/archive.service';
import {UIViewLoaderService} from '../../ui/ui-view-loader.service';
import {Archive} from '../../archive/archive.enum';
import {UILoadableComponent} from '../../ui/abstract.ui-loadable.component';

@Component({
  selector   : 'app-article',
  templateUrl: 'article.component.html',
  styleUrls  : ['article.component.scss']
})
export class ArticleComponent extends UILoadableComponent {

  public article: Article;
  public relatedArticles: Object[] = undefined;
  public showRelated = false;
  private args: ArticleQueryParams;

  constructor(protected NS: NewsArticleService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected archiveService: ArchiveService,
              protected domSanitizer: DomSanitizer,
              @Inject(DOCUMENT) protected document: Document,
              loaderService: UIViewLoaderService) {
    super(loaderService);
  }

  init() {
    this.archiveService.activate(Archive.article);
    this.initializeData();
  }

  protected initializeData() {
    this.route.params
        .map(params => params['slug']).subscribe((slug) => {

      this.sub = this.NS.getArticle(slug).subscribe(
        posts => {

          const body = this.domSanitizer.bypassSecurityTrustHtml(posts[0].body_html);
          this.article = {...posts[0], body_html: body};
          if (isNullOrUndefined(posts[0])) {
            this.router.navigate(['404']);
          }

          this.loaded();

          this.loadRelatedPosts(posts[0]); // <-- Needs to be chained

          // TODO: Make a chain of observables and trigger this.loadComplete() once chain has finished loading.

        },
        error => {
          this.loaded();

          switch (error.status) {
            case 404:
              this.router.navigate(['404']);
              break;
            default:
              this.router.navigate(['error'], {
                queryParams: {
                  status: error.status,
                  origin: this.document.location.href
                }
              });
              break;
          }
        });
    });
  }

  /**
   * Loads related posts from
   * @param post
   */
  protected loadRelatedPosts(post) {

    // Clearing variables
    this.args = <ArticleQueryParams>{};
    this.relatedArticles = [];
    this.showRelated = false;

    setTimeout(() => this.checkQuoteElement());

    // If this article has related posts defined
    if (post.related_posts !== undefined) {

      for (let i = 0; i < post.related_posts.length; i++) {

        this.NS.getArticle(post.related_posts[i].post_name).subscribe(
          related_post => {
            this.relatedArticles.push(related_post[0]);
          }
        );
        this.showRelated = true;
      }
    } else {

      // Randomizes which category we look at for related posts
      if (post.categoriesById.length > 0) {
        const randomCat = this.getRandomInt(0, post.categoriesById.length - 1);
        this.args.category = post.categoriesById[randomCat];
      }

      this.NS.getArticles(this.args).subscribe(
        relatedPosts => {

          const usedNumbers = [];
          let randomNum;
          // Grabs three random related articles from the same category as the original post
          for (let j = 0; j < 3; j++) {
            randomNum = this.getRandomInt(0, 11);

            // If we have used this number OR if this number points to the current article, find another number
            while (usedNumbers.indexOf(randomNum) > -1 || relatedPosts[randomNum].id === post.id) {
              randomNum = this.getRandomInt(0, 11);
            }
            usedNumbers.push(randomNum);
            this.relatedArticles.push(relatedPosts[randomNum]);
          }

          if (this.relatedArticles.length === 0) {
            this.showRelated = false;
          }

        });

      this.showRelated = true;
    }
  }

  // Check if there are qoutes in article and add qoute symbol if so.
  protected checkQuoteElement() {
    const d: any = this.document.getElementsByTagName('blockquote');

    for (let i = 0; i < d.length; i++) {
      // Create quote symbol element
      const e: any = this.document.createElement('i');
      const classAtt: any = this.document.createAttribute('class');
      classAtt.value = 'fa fa-quote-right';
      e.setAttributeNode(classAtt);
      const ariaAtt: any = this.document.createAttribute('aria-hidden');
      ariaAtt.value = 'true';
      e.setAttributeNode(ariaAtt);
      d[i].insertBefore(e, d[i].firstChild);
    }
  }

  protected getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
