import {Component, OnInit, OnDestroy} from '@angular/core';
import {ArchiveService} from "../archive.service";
import {isUndefined} from "util";

@Component({
	selector: 'app-search',
	templateUrl: 'search-widget.component.html',
	styleUrls: ['search-widget.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

	public searchInput: string;
	public visible: boolean = false;
	private sub;

	constructor(private archiveService: ArchiveService) {
	}

	public search(){
		let s: string;
		s = isUndefined(this.searchInput) ? '' : this.searchInput;

		if(s !== '') this.archiveService.search(s);
	}

	ngOnInit() {
		this.sub = this.archiveService.activated.subscribe(
			(activated) => this.visible = activated
		);

		this.sub = this.archiveService.filter.subscribe(
			filter => {
				this.searchInput = filter.searchTerm;
			}
		);

		this.sub = this.archiveService.resetListener.subscribe(
			() => this.searchInput = ''
		);
	}

	ngOnDestroy(){
		this.sub.unsubscribe();
	}

}
