/** @format */
/**
 * External dependencies
 */
import { map, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { READER_RECOMMENDED_SITES_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { receiveRecommendedSites } from 'state/reader/recommended-sites/actions';

export const requestRecommendedSites = ( { dispatch }, action ) => {
	const { seed = 1, number = 10, offset = 0 } = action.payload;
	dispatch(
		http( {
			method: 'GET',
			path: '/read/recommendations/sites',
			query: { number, offset, seed, posts_per_site: 0 },
			apiVersion: '1.2',
			onSuccess: action,
			onFailure: action,
		} )
	);
};

export const fromApi = response => {
	if ( ! response ) {
		return [];
	}

	return map( response.sites, site => ( {
		feedId: site.feed_id,
		blogId: site.blog_id,
		title: decodeEntities( site.blog_title ),
		url: site.blog_url,
		railcar: site.railcar,
		algorithm: response.algorithm,
	} ) );
};

export const receiveRecommendedSitesResponse = ( store, action, response ) => {
	if ( ! response.sites ) {
		return;
	}

	store.dispatch(
		receiveRecommendedSites( {
			sites: fromApi( response ),
			seed: action.payload.seed,
			offset: action.payload.offset,
		} )
	);
};

export default {
	[ READER_RECOMMENDED_SITES_REQUEST ]: [
		dispatchRequest( requestRecommendedSites, receiveRecommendedSitesResponse, noop ),
	],
};
