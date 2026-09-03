import { decodeEntities } from '@wordpress/html-entities';
import type {
	ReadSiteRecommendation,
	ReadSiteRecommendationResponse,
	ReadSiteRecommendationsResponse,
} from './types';

export const adaptReadSiteRecommendation = (
	site: ReadSiteRecommendationResponse,
	algorithm: string
): ReadSiteRecommendation => ( {
	algorithm,
	blogId: site.blog_id,
	description: site.description,
	feedId: site.feed_id,
	feedUrl: site.feed_url,
	icon: site.icon?.img,
	railcar: site.railcar,
	title: decodeEntities( site.blog_title ?? site.name ),
	url: site.blog_url ?? site.URL,
} );

export const adaptReadSiteRecommendationsResponse = (
	response: ReadSiteRecommendationsResponse
): ReadSiteRecommendation[] =>
	response.sites.map( ( site ) => adaptReadSiteRecommendation( site, response.algorithm ) );
