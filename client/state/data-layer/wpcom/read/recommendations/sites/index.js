import { decodeEntities } from 'calypso/lib/formatting';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { READER_RECOMMENDED_SITES_REQUEST } from 'calypso/state/reader/action-types';
import { receiveRecommendedSites } from 'calypso/state/reader/recommended-sites/actions';

const noop = () => {};

export const requestRecommendedSites = ( action ) => {
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

export const fromApi = ( { algorithm, sites } ) =>
	sites.map( ( site ) => ( {
		feedId: site.feed_id,
		blogId: site.blog_id,
		title: decodeEntities( site.blog_title ),
		url: site.blog_url ?? site.URL,
		railcar: site.railcar,
		algorithm,
	} ) );

export const addRecommendedSites = ( { payload: { seed, offset } }, sites ) =>
	receiveRecommendedSites( { sites, seed, offset } );

registerHandlers( 'state/data-layer/wpcom/read/recommendations/sites/index.js', {
	[ READER_RECOMMENDED_SITES_REQUEST ]: [
		dispatchRequest( {
			fetch: requestRecommendedSites,
			onSuccess: addRecommendedSites,
			onError: noop,
			fromApi,
		} ),
	],
} );
