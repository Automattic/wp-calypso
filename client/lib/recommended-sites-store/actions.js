/**
 * External Dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { isRequestInflight, requestTracker } from 'lib/inflight';
import store from './store';
import { ACTION_RECEIVE_SITE_RECOMMENDATIONS, ACTION_RECEIVE_SITE_RECOMMENDATIONS_ERROR } from './constants';
import siteStoreActions from 'lib/reader-site-store/actions';

function extractSiteId( siteRecommendation ) {
	return siteRecommendation.blog_id;
}

export function fetchMore() {
	if ( isRequestInflight( ACTION_RECEIVE_SITE_RECOMMENDATIONS ) ) {
		return;
	}

	// get the current recs that we want to exclude
	const args = {
		number: 10,
		source: 'reader_sidebar',
		meta: 'site'
	};

	let currentIds = store.get();

	if ( currentIds && currentIds.length > 0 ) {
		currentIds = currentIds.map( extractSiteId );
		args.exclude = currentIds;
	}

	wpcom.undocumented().fetchSiteRecommendations( args, requestTracker( ACTION_RECEIVE_SITE_RECOMMENDATIONS, function( error, data ) {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ACTION_RECEIVE_SITE_RECOMMENDATIONS_ERROR,
				data: data,
				error: error
			} );
		} else {
			// look for sites in meta and dispatch those first
			if ( data && data.blogs ) {
				data.blogs.forEach( function( blog ) {
					const site = get( blog, 'meta.data.site' );
					if ( site ) {
						siteStoreActions.receiveFetch( site.ID, undefined, site );
					}
				} );
			}

			Dispatcher.handleServerAction( {
				type: ACTION_RECEIVE_SITE_RECOMMENDATIONS,
				data: data
			} );
		}
	} ) );
}
