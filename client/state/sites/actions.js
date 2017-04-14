/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SITE_DELETE_RECEIVE,
	SITE_FRONT_PAGE_SET,
	SITE_FRONT_PAGE_SET_FAILURE,
	SITE_FRONT_PAGE_SET_SUCCESS,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_SUCCESS,
	SITES_REQUEST_FAILURE,
	SITES_UPDATE
} from 'state/action-types';
import {
	bumpStat,
	recordTracksEvent,
} from 'state/analytics/actions';
import { omit } from 'lodash';

/**
 * Returns an action object to be used in signalling that a site has been
 * deleted.
 *
 * @param  {Object} site Site received
 * @return {Object}      Action object
 */
export function receiveDeletedSite( site ) {
	return {
		type: SITE_DELETE_RECEIVE,
		site
	};
}

/**
 * Returns an action object to be used in signalling that a site object has
 * been received.
 *
 * @param  {Object} site Site received
 * @return {Object}      Action object
 */
export function receiveSite( site ) {
	return {
		type: SITE_RECEIVE,
		site
	};
}

/**
 * Returns an action object to be used in signalling that site objects have
 * been received.
 *
 * @param  {Object[]} sites Sites received
 * @return {Object}         Action object
 */
export function receiveSites( sites ) {
	return {
		type: SITES_RECEIVE,
		sites
	};
}

/**
 * Returns an action object to be used in signalling that sites objects have
 * been updated.
 *
 * @param  {Object[]} sites Sites updated
 * @return {Object}         Action object
 */
export function receiveSiteUpdates( sites ) {
	return {
		type: SITES_UPDATE,
		sites
	};
}

/**
 * Triggers a network request to request all visible sites
 * @returns {Function}        Action thunk
 */
export function requestSites() {
	return ( dispatch ) => {
		dispatch( {
			type: SITES_REQUEST
		} );
		return wpcom.me().sites( { site_visibility: 'all', include_domain_only: true } ).then( ( response ) => {
			dispatch( receiveSites( response.sites ) );
			dispatch( {
				type: SITES_REQUEST_SUCCESS
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: SITES_REQUEST_FAILURE,
				error
			} );
		} );
	};
}

/**
 * Returns a function which, when invoked, triggers a network request to fetch
 * a site.
 *
 * @param  {Number}   siteId Site ID
 * @return {Function}        Action thunk
 */
export function requestSite( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_REQUEST,
			siteId
		} );

		return wpcom.site( siteId ).get().then( ( site ) => {
			dispatch( receiveSite( omit( site, '_headers' ) ) );
			dispatch( {
				type: SITE_REQUEST_SUCCESS,
				siteId
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: SITE_REQUEST_FAILURE,
				siteId,
				error
			} );
		} );
	};
}

export function setFrontPage( siteId, pageId, successCallback ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_FRONT_PAGE_SET,
			siteId,
			pageId
		} );

		const isSettingBlogPostsAsFrontPage = pageId === 0;

		const requestData = {
			is_page_on_front: ! isSettingBlogPostsAsFrontPage,
			page_on_front_id: pageId,
		};

		if ( isSettingBlogPostsAsFrontPage ) {
			requestData.page_for_posts_id = 0;
		}

		return wpcom.undocumented().setSiteHomepageSettings( siteId, requestData ).then( ( response ) => {
			const updatedOptions = {
				page_on_front: parseInt( response.page_on_front_id, 10 ),
				show_on_front: response.is_page_on_front ? 'page' : 'posts',
			};

			if ( 0 === response.page_for_posts_id || response.page_for_posts_id ) {
				updatedOptions.page_for_posts = parseInt( response.page_for_posts_id, 10 );
			}

			// This gives us a means to fix the `SitesList` cache outside of actions
			// @todo Remove this when `SitesList` is Reduxified
			if ( 'function' === typeof( successCallback ) ) {
				successCallback( {
					siteId,
					updatedOptions,
				} );
			}

			dispatch( recordTracksEvent( 'calypso_front_page_set', {
				siteId,
				pageId,
			} ) );
			dispatch( bumpStat( 'calypso_front_page_set', 'success' ) );
			dispatch( {
				type: SITE_FRONT_PAGE_SET_SUCCESS,
				siteId,
				updatedOptions,
			} );
		} ).catch( ( error ) => {
			dispatch( bumpStat( 'calypso_front_page_set', 'failure' ) );
			dispatch( {
				type: SITE_FRONT_PAGE_SET_FAILURE,
				siteId,
				pageId,
				error
			} );
		} );
	};
}
