
/**
 * External Dependencies
 */
import { map } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	READER_RECOMMENDED_SITES_REQUEST
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { receiveRecommendedSites } from 'state/reader/recommended-sites/actions';

export function requestRecommendedSites( { dispatch }, action, next ) {
	const { seed = 1, number = 10, offset = 0 } = action.payload;
	dispatch( http( {
		method: 'GET',
		path: `/read/recommendations/sites?number=${ number }&offset=${ offset }&seed=${ seed }`,
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} ) );
	next( action );
}

// TODO: should we be grabbing url from the post object (feed_URL).
// the current one seems fishy
export const fromApi = response => {
	if ( ! response ) {
		return [];
	}

	return map( response.sites, site => ( {
		feedId: site.feed_id,
		blogId: site.blog_id,
		title: site.blog_title,
		url: site.blog_url,
	} ) );
};

export function receiveRecommendedSitesResponse( store, action, next, response ) {
	if ( ! response.sites ) {
		return;
	}

	store.dispatch( receiveRecommendedSites( {
		sites: fromApi( response ),
		seed: action.payload.seed,
	} ) );
}

export function receiveError( store, action, next ) {
	// no-op
	next( action );
}

export default {
	[ READER_RECOMMENDED_SITES_REQUEST ]: [
		dispatchRequest(
			requestRecommendedSites,
			receiveRecommendedSitesResponse,
			receiveError
		)
	],
};
