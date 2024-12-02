import { Action } from 'redux';
import { Railcar } from 'calypso/data/marketplace/types';
import { decodeEntities } from 'calypso/lib/formatting';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { READER_RECOMMENDED_SITES_REQUEST } from 'calypso/state/reader/action-types';
import {
	receiveRecommendedSites,
	RecommendedSitesRequestAction,
} from 'calypso/state/reader/recommended-sites/actions';

const noop = () => {};

export const requestRecommendedSites = ( action: RecommendedSitesRequestAction ): Action => {
	const { seed = 1, number = 10, offset = 0 } = action.payload;

	return http( {
		method: 'GET',
		path: '/read/recommendations/sites',
		query: { number, offset, seed, posts_per_site: 0 },
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} );
};

export interface RecommendedSitesBody {
	algorithm: string;
	sites: RecommendedSiteResponse[];
	meta: {
		next_page: string;
	};
}

interface RecommendedSiteResponse {
	blog_id: number;
	blog_title?: string;
	blog_url?: string;
	description: string;
	feed_id: number;
	feed_url: string;
	icon: {
		ico: string;
		img: string;
		media_id: string;
	};
	ID: number;
	name: string;
	railcar: Railcar;
	URL: string;
}

export interface RecommendedSite {
	algorithm: string;
	blogId: number;
	feedId: number;
	railcar: Railcar;
	title: string;
	url: string;
}

export const mapResponseToRecommendedSites = ( {
	algorithm,
	sites,
}: RecommendedSitesBody ): RecommendedSite[] =>
	sites.map(
		( site: RecommendedSiteResponse ): RecommendedSite => ( {
			algorithm,
			blogId: site.blog_id,
			feedId: site.feed_id,
			railcar: site.railcar,
			title: decodeEntities( site.blog_title ?? '' ),
			url: site.blog_url ?? site.URL,
		} )
	);

export const addRecommendedSites = (
	{ payload: { seed, offset } }: RecommendedSitesRequestAction,
	sites: RecommendedSite[]
) => receiveRecommendedSites( { sites, seed, offset } );

registerHandlers( 'state/data-layer/wpcom/read/recommendations/sites/index.js', {
	[ READER_RECOMMENDED_SITES_REQUEST ]: [
		dispatchRequest( {
			fetch: requestRecommendedSites,
			onSuccess: addRecommendedSites,
			onError: noop,
			fromApi: mapResponseToRecommendedSites,
		} ),
	],
} );
