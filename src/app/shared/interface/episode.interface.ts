import {Series} from "./series.interface";
import {EpisodeRendition} from "./media-rendition.interface";
import {Rendition} from "./rendition.interface";
import {Byline} from "./byline.interface";

export interface Episode {
    id: number,
    slug: string,
    content: string,
    excerpt: string,
    byline: Array<Byline>,
    renditions: {[id:string]: Rendition},
    episode_number: number | string,
    media: EpisodeRendition,
    series: Series,
    headline: string,
    versioncreated: string
}