import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { omit } from 'lodash';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import wpcom from 'calypso/lib/wp';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import {
	SITE_LEAVE_RECEIVE,
	SITE_DELETE_RECEIVE,
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
	SITE_RESET,
} from 'calypso/state/action-types';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getP2HubBlogId from 'calypso/state/selectors/get-p2-hub-blog-id';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import { SITE_REQUEST_FIELDS, SITE_REQUEST_OPTIONS } from 'calypso/state/sites/constants';
import { getSiteDomain, getSiteSlug } from 'calypso/state/sites/selectors';

/**
 * Returns a thunk that dispatches an action object to be used in signalling that a site has been
 * deleted. It also re-fetches the current user.
 * @param  {number} siteId  ID of deleted site
 * @returns {Function}        Action thunk
 */
export function receiveLeaveSite( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_LEAVE_RECEIVE,
			siteId,
		} );
		dispatch( fetchCurrentUser() );
	};
}

/**
 * Returns a thunk that dispatches an action object to be used in signalling that a site has been
 * deleted. It also re-fetches the current user.
 * @param  {number} siteId  ID of deleted site
 * @returns {Function}        Action thunk
 */
export function receiveDeletedSite( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_DELETE_RECEIVE,
			siteId,
		} );
		dispatch( fetchCurrentUser() );
	};
}

/**
 * Returns an action object to be used in signalling that a site object has
 * been received.
 * @param  {Object} site Site received
 * @returns {Object}      Action object
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
 * @param  {Object[]} sites Sites received
 * @returns {Object}         Action object
 */
export function receiveSites( sites ) {
	return {
		type: SITES_RECEIVE,
		sites,
	};
}

export function resetSite( siteId ) {
	return {
		type: SITE_RESET,
		siteId,
	};
}

/**
 * Triggers a network request to request all visible sites
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
				const jetpackCloudSites = response.sites.filter( ( site ) => {
					const isJetpack =
						site?.jetpack || Boolean( site?.options?.jetpack_connection_active_plugins?.length );

					// Filter Jetpack Cloud sites to exclude P2 and Simple non-Classic sites by default.
					const isP2 = site?.options?.is_wpforteams_site;
					const isSimpleClassic =
						! isJetpack &&
						! site?.is_wpcom_atomic &&
						site?.options?.wpcom_admin_interface !== 'wp-admin';

					return ! isP2 && ! isSimpleClassic;
				} );
				dispatch( receiveSites( isJetpackCloud() ? jetpackCloudSites : response.sites ) );
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
 * @param {number|string} siteFragment Site ID or slug
 * @returns {import('redux-thunk').ThunkAction} Action thunk
 */
export function requestSite( siteFragment ) {
	function doRequest( forceWpcom ) {
		const query = { apiVersion: '1.2' };
		if ( forceWpcom ) {
			query.force = 'wpcom';
		}

		const siteFilter = config( 'site_filter' );
		if ( siteFilter.length > 0 ) {
			query.filters = siteFilter.join( ',' );
		}

		return wpcom.site( siteFragment ).get( query );
	}

	return ( dispatch, getState ) => {
		dispatch( { type: SITE_REQUEST, siteId: siteFragment } );

		const result = doRequest( false ).catch( ( error ) => {
			// if there is Jetpack JSON API module error, retry with force: 'wpcom'
			if (
				( error?.status === 403 &&
					error?.message === 'API calls to this blog have been disabled.' ) ||
				( error?.status === 400 && error?.name === 'ApiNotFoundError' )
			) {
				return doRequest( true );
			}

			return Promise.reject( error );
		} );

		result
			.then( ( site ) => {
				// If we can't manage the site, don't add it to state.
				if ( site && site.capabilities ) {
					const state = getState();

					const wasAtomic = state?.sites?.items?.[ siteFragment ]?.options?.is_wpcom_atomic;
					const isAtomic = site?.options?.is_wpcom_atomic;
					const hasSiteTransferredToAtomic = ! wasAtomic && isAtomic;

					const wasAdmin = state?.currentUser?.capabilities?.[ siteFragment ]?.manage_options;
					const isAdmin = site?.capabilities?.manage_options;
					const hasMismatchingCapabilities = wasAdmin && ! isAdmin;

					/*
					 * Capabilities are not immediately propagated to the Atomic site
					 * after transfer, so let's hold off updating the state until the
					 * endpoint returns accurate data.
					 */
					if ( hasSiteTransferredToAtomic && hasMismatchingCapabilities ) {
						setTimeout( () => dispatch( requestSite( siteFragment ) ), 2000 );
					} else {
						dispatch( receiveSite( omit( site, '_headers' ) ) );
					}
				}

				dispatch( { type: SITE_REQUEST_SUCCESS, siteId: siteFragment } );
			} )
			.catch( () => {
				dispatch( { type: SITE_REQUEST_FAILURE, siteId: siteFragment } );
			} );

		return result;
	};
}

const siteLeaveNoticeId = 'site-leave';
const siteLeaveNoticeOptions = {
	duration: 5000,
	id: siteLeaveNoticeId,
};

/**
 * Returns a function which, when invoked, triggers a network request to delete
 * a user from a specified site.
 * @param  {number}   siteId Site ID
 * @param  {number}   userId User ID
 * @returns {Function}        Action thunk
 */
export function leaveSite( siteId, userId ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const siteDomain = getSiteDomain( state, siteId );
		const siteSlug = getSiteSlug( state, siteId );
		const isAdmin = canCurrentUser( state, siteId, 'manage_options' );

		return wpcom.req
			.post( `/sites/${ siteId }/users/${ userId }/delete` )
			.then( () => {
				dispatch( receiveLeaveSite( siteId ) );
				dispatch(
					successNotice(
						translate( 'You have left %(siteDomain)s successfully.', { args: { siteDomain } } ),
						siteLeaveNoticeOptions
					)
				);
				dispatch(
					recordTracksEvent( 'calypso_leave_blog_success', {
						site_id: siteId,
						is_admin: isAdmin,
					} )
				);
				return true;
			} )
			.catch( ( error ) => {
				if (
					error.error === 'user_owns_domain_subscription' ||
					error.error === 'user_has_active_subscriptions'
				) {
					dispatch(
						errorNotice(
							translate( 'You must cancel any active subscriptions prior to leave your site.' ),
							{
								id: siteLeaveNoticeId,
								showDismiss: false,
								button: translate( 'Manage Purchases' ),
								href: `/purchases/subscriptions/${ siteSlug }`,
							}
						)
					);
				} else {
					dispatch( errorNotice( error.message, siteLeaveNoticeOptions ) );
				}

				dispatch(
					recordTracksEvent( 'calypso_leave_blog_failure', {
						site_id: siteId,
						is_admin: isAdmin,
					} )
				);
				return false;
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
 * @param  {number}   siteId Site ID
 * @returns {Function}        Action thunk
 */
export function deleteSite( siteId ) {
	return ( dispatch, getState ) => {
		const siteDomain = getSiteDomain( getState(), siteId );

		dispatch(
			successNotice(
				translate( '%(siteDomain)s is being deleted.', { args: { siteDomain } } ),
				siteDeletionNoticeOptions
			)
		);

		return wpcom.req
			.post( `/sites/${ siteId }/delete` )
			.then( () => {
				dispatch( receiveDeletedSite( siteId ) );
				dispatch(
					successNotice(
						translate( '%(siteDomain)s has been deleted.', { args: { siteDomain } } ),
						siteDeletionNoticeOptions
					)
				);
			} )
			.catch( ( error ) => {
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
				if ( error.error === 'p2-hub-has-spaces' ) {
					const hubId = getP2HubBlogId( getState(), siteId );
					const hubUrl = getSiteUrl( getState(), hubId );
					dispatch(
						errorNotice(
							translate(
								'Your P2 Workspace has P2s. You must delete all P2s in this workspace before you can delete it.'
							),
							{
								id: siteDeletionNoticeId,
								showDismiss: false,
								button: translate( 'Manage P2s' ),
								href: hubUrl,
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
 * @param  {number} siteId Site ID
 * @param  {Object} frontPageOptions Object containing the three optional front page options.
 * @param  {string} [frontPageOptions.show_on_front] What to show in homepage. Can be 'page' or 'posts'.
 * @param  {number} [frontPageOptions.page_on_front] If `show_on_front = 'page'`, the front page ID.
 * @param  {number} [frontPageOptions.page_for_posts] If `show_on_front = 'page'`, the posts page ID.
 * @returns {Object} Action object
 */
export const updateSiteFrontPage = ( siteId, frontPageOptions ) => async ( dispatch ) => {
	try {
		const response = await wpcom.req.post( `/sites/${ siteId }/homepage`, {
			is_page_on_front: isPageOnFront( frontPageOptions.show_on_front ),
			page_on_front_id: frontPageOptions.page_on_front,
			page_for_posts_id: frontPageOptions.page_for_posts,
		} );

		dispatch(
			receiveSiteFrontPage( siteId, {
				show_on_front: response.is_page_on_front ? 'page' : 'posts',
				page_on_front: response.page_on_front_id,
				page_for_posts: response.page_for_posts_id,
			} )
		);
	} catch {}
};

function isPageOnFront( showOnFront ) {
	switch ( showOnFront ) {
		case 'page':
			return true;
		case 'posts':
			return false;
		default:
			return undefined;
	}
}

export function receiveSiteFrontPage( siteId, { show_on_front, page_on_front, page_for_posts } ) {
	return {
		type: SITE_FRONT_PAGE_UPDATE,
		siteId,
		frontPageOptions: {
			show_on_front,
			page_on_front: parseInt( page_on_front, 10 ),
			page_for_posts: parseInt( page_for_posts, 10 ),
		},
	};
}

/**
 * Returns an action object to be used to update the site migration status.
 * @param {number} siteId Site ID
 * @param {string} migrationStatus The status of the migration.
 * @param {string} migrationErrorStatus The status error of the migration.
 * @param {string} lastModified Optional timestamp from the migration DB record
 * @returns {Object} Action object
 */
export const updateSiteMigrationMeta = (
	siteId,
	migrationStatus,
	migrationErrorStatus,
	lastModified = null
) => ( {
	siteId,
	type: SITE_MIGRATION_STATUS_UPDATE,
	migrationStatus,
	migrationErrorStatus,
	lastModified,
} );
