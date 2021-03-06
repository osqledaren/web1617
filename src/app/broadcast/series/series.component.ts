import {Component, Host} from '@angular/core';
import {UILoadableComponent} from '../../ui/abstract.ui-loadable.component';
import {BroadcastLoaderService} from '../broadcast-loader.service';
import {MediaContentService} from '../abstract.media-content.service';
import {Series} from '../series.interface';

@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.scss']
})
export class SeriesComponent extends UILoadableComponent {

  public series: Array<Series>;
  public hasMorePosts: boolean;
  public isInitialized: boolean;

  constructor(@Host() private mediaService: MediaContentService,
              loaderService: BroadcastLoaderService) {
    super(loaderService);
  }

  init() {
    this.sub = this.mediaService.getSeries().subscribe(
      (series: Array<Series>) => {
        this.series = series;
        if (series.length <= 0) {
          this.hasMorePosts = false;
        }
        this.hasMore(series);
        this.isInitialized = true;
        this.mediaService.initialized.next(true);
        this.loaded();
      }
    );
  }

  public hasMore(posts) {
    if (posts.length < this.mediaService.getSeriesBatchCount()) {
      this.hasMorePosts = false;
    }
  }

  public appendData() {
    if (!this.isInitialized) {
      return;
    }
    this.sub = this.mediaService.getNextBatchOfSeries().subscribe(
      (series: Array<Series>) => {
        if (series.length <= 0) {
          this.hasMorePosts = false;
          return;
        }

        this.hasMore(series);
        this.series = this.series.concat(series);
      });
  }

}
