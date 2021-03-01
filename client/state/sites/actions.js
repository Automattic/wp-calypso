/**
 * External dependencies
 */
import { omit } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import config from '@automattic/calypso-config';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import {
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_RECEIVE,
	SITE_DELETE_SUCCESS,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_SUCCESS,
	SITES_REQUEST_FAILURE,
	SITE_PLUGIN_UPDATED,
	SITE_FRONT_PAGE_UPDATE,
	SITE_MIGRATION_STATUS_UPDATE,
} from 'calypso/state/action-types';
import { SITE_REQUEST_FIELDS, SITE_REQUEST_OPTIONS } from 'calypso/state/sites/constants';

import 'calypso/state/data-layer/wpcom/sites/homepage';

/**
 * Returns an action object to be used in signalling that a site has been
 * deleted.
 *
 * @param  {number} siteId  ID of deleted site
 * @returns {object}         Action object
 */
export function receiveDeletedSite( siteId ) {
	return {
		type: SITE_DELETE_RECEIVE,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that a site object has
 * been received.
 *
 * @param  {object} site Site received
 * @returns {object}      Action object
 */
export function receiveSite( site ) {
	return {
		type: SITE_RECEIVE,
		site,
	};
}

/**
 * Returns an action object to be used in signalling that site objects have
 * been received.
 *
 * @param  {object[]} sites Sites received
 * @returns {object}         Action object
 */
export function receiveSites( sites ) {
	return {
		type: SITES_RECEIVE,
		sites,
	};
}

/**
 * Triggers a network request to request all visible sites
 *
 * @returns {Function}        Action thunk
 */
export function requestSites() {
	return ( dispatch ) => {
		dispatch( {
			type: SITES_REQUEST,
		} );
		const siteFilter = config( 'site_filter' );

		return wpcom
			.me()
			.sites( {
				apiVersion: '1.2',
				site_visibility: 'all',
				include_domain_only: true,
				site_activity: 'active',
				fields: SITE_REQUEST_FIELDS,
				options: SITE_REQUEST_OPTIONS,
				filters: siteFilter.length > 0 ? siteFilter.join( ',' ) : undefined,
			} )
			.then( ( response ) => {
				dispatch( receiveSites( response.sites ) );
				dispatch( {
					type: SITES_REQUEST_SUCCESS,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITES_REQUEST_FAILURE,
					error,
				} );
			} );
	};
}

/**
 * Returns a function which, when invoked, triggers a network request to fetch
 * a site.
 *
 * @param {number|string} siteFragment Site ID or slug
 * @param {boolean} forceWpcom explicitly get info from WPCOM vs Jetpack site
 * @returns {Function}              Action thunk
 */
export function requestSite( siteFragment, forceWpcom = false ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_REQUEST,
			siteId: siteFragment,
		} );
		const siteFilter = config( 'site_filter' );
		return wpcom
			.site( siteFragment )
			.get( {
				apiVersion: '1.2',
				filters: siteFilter.length > 0 ? siteFilter.join( ',' ) : undefined,
				force: forceWpcom ? 'wpcom' : undefined,
			} )
			.then( ( site ) => {
				// If we can't manage the site, don't add it to state.
				if ( ! ( site && site.capabilities ) ) {
					return dispatch( {
						type: SITE_REQUEST_FAILURE,
						siteId: siteFragment,
						site,
						error: translate( 'No access to manage the site' ),
					} );
				}

				dispatch( receiveSite( omit( site, '_headers' ) ) );

				dispatch( {
					type: SITE_REQUEST_SUCCESS,
					siteId: siteFragment,
				} );
			} )
			.catch( ( error ) => {
				if (
					error?.status === 403 &&
					error?.message === 'API calls to this blog have been disabled.' &&
					! forceWpcom
				) {
					return dispatch( requestSite( siteFragment, true ) );
				}
				dispatch( {
					type: SITE_REQUEST_FAILURE,
					siteId: siteFragment,
					error,
				} );
			} );
	};
}

const siteDeletionNoticeId = 'site-delete';
const siteDeletionNoticeOptions = {
	duration: 5000,
	id: siteDeletionNoticeId,
};

/**
 * Returns a function which, when invoked, triggers a network request to delete
 * a site.
 *
 * @param  {number}   siteId Site ID
 * @returns {Function}        Action thunk
 */
export function deleteSite( siteId ) {
	return ( dispatch, getState ) => {
		const siteDomain = getSiteDomain( getState(), siteId );

		dispatch( {
			type: SITE_DELETE,
			siteId,
		} );

		dispatch(
			successNotice(
				translate( '%(siteDomain)s is being deleted.', { args: { siteDomain } } ),
				siteDeletionNoticeOptions
			)
		);

		return wpcom
			.undocumented()
			.deleteSite( siteId )
			.then( () => {
				dispatch( receiveDeletedSite( siteId ) );
				dispatch( {
					type: SITE_DELETE_SUCCESS,
					siteId,
				} );
				dispatch(
					successNotice(
						translate( '%(siteDomain)s has been deleted.', { args: { siteDomain } } ),
						siteDeletionNoticeOptions
					)
				);
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_DELETE_FAILURE,
					siteId,
					error,
				} );
				if ( error.error === 'active-subscriptions' ) {
					dispatch(
						errorNotice(
							translate( 'You must cancel any active subscriptions prior to deleting your site.' ),
							{
								id: siteDeletionNoticeId,
								showDismiss: false,
								button: translate( 'Manage Purchases' ),
								href: purchasesRoot,
							}
						)
					);
					return;
				}

				dispatch( errorNotice( error.message, siteDeletionNoticeOptions ) );
			} );
	};
}

export const sitePluginUpdated = ( siteId ) => ( {
	type: SITE_PLUGIN_UPDATED,
	siteId,
} );

/**
 * Returns an action object to be used to update the site front page options.
 *
 * @param  {number} siteId Site ID
 * @param  {object} frontPageOptions Object containing the three optional front page options.
 * @param  {string} [frontPageOptions.show_on_front] What to show in homepage. Can be 'page' or 'posts'.
 * @param  {number} [frontPageOptions.page_on_front] If `show_on_front = 'page'`, the front page ID.
 * @param  {number} [frontPageOptions.page_for_posts] If `show_on_front = 'page'`, the posts page ID.
 * @returns {object} Action object
 */
export const updateSiteFrontPage = ( siteId, frontPageOptions ) => ( {
	type: SITE_FRONT_PAGE_UPDATE,
	siteId,
	frontPageOptions,
} );

/**
 * Returns an action object to be used to update the site migration status.
 *
 * @param  {number} siteId Site ID
 * @param  {string} migrationStatus The status of the migration.
 * @param {string} lastModified Optional timestamp from the migration DB record
 * @returns {object} Action object
 */
export const updateSiteMigrationMeta = ( siteId, migrationStatus, lastModified = null ) => ( {
	siteId,
	type: SITE_MIGRATION_STATUS_UPDATE,
	migrationStatus,
	lastModified,
} );
