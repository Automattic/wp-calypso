import { delay } from 'lodash';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { requestSite } from 'calypso/state/sites/actions';
import {
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE,
	THEME_UPLOAD_SUCCESS,
} from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

function initiateTransfer( siteId, plugin, theme, geoAffinity, context, onProgress ) {
	return new Promise( ( resolve, rejectPromise ) => {
		const resolver = ( error, data ) => {
			error ? rejectPromise( error ) : resolve( data );
		};

		const post = {
			path: `/sites/${ siteId }/automated-transfers/initiate`,
		};
		post.body = {};
		if ( plugin ) {
			post.body = {
				...post.body,
				plugin,
			};
		}
		if ( theme ) {
			post.formData = [ [ 'theme', theme ] ];
		}

		if ( geoAffinity ) {
			post.body = {
				...post.body,
				geo_affinity: geoAffinity,
			};
		}

		if ( context ) {
			post.body = {
				...post.body,
				context,
			};
		}

		const req = wpcom.req.post( post, resolver );
		req && ( req.upload.onprogress = onProgress );
	} );
}

/**
 * Start an Automated Transfer with an uploaded theme.
 * @param {number} siteId -- the site to transfer
 * @param {window.File} file -- theme zip to upload
 * @param {string} plugin -- plugin slug
 * @param {string} geoAffinity -- geographic affinity for the new site
 * @param {string} context -- place where this function is being called (e.g. hosting configuration, theme/plugin upload)
 * @returns {Promise} for testing purposes only
 */
export function initiateThemeTransfer( siteId, file, plugin, geoAffinity = '', context ) {
	return ( dispatch ) => {
		const themeInitiateRequest = {
			type: THEME_TRANSFER_INITIATE_REQUEST,
			siteId,
		};

		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_automated_transfer_initiate_transfer', { plugin, context } ),
				themeInitiateRequest
			)
		);
		return initiateTransfer( siteId, plugin, file, geoAffinity, context, ( event ) => {
			dispatch( {
				type: THEME_TRANSFER_INITIATE_PROGRESS,
				siteId,
				loaded: event.loaded,
				total: event.total,
			} );
		} )
			.then( ( { transfer_id } ) => {
				if ( ! transfer_id ) {
					return dispatch(
						transferInitiateFailure( siteId, { error: 'initiate_failure' }, plugin, context )
					);
				}
				const themeInitiateSuccessAction = {
					type: THEME_TRANSFER_INITIATE_SUCCESS,
					siteId,
					transferId: transfer_id,
				};
				dispatch(
					withAnalytics(
						recordTracksEvent( 'calypso_automated_transfer_initiate_success', { plugin, context } ),
						themeInitiateSuccessAction
					)
				);

				return dispatch( pollThemeTransferStatus( siteId, transfer_id, 3000, 180000, !! file ) );
			} )
			.then( () => {
				// Get the latest site data after the atomic transfer. The request
				// is intentionally delayed because the site endpoint can return
				// stale data immediately after the transfer.
				setTimeout( () => {
					dispatch( requestSite( siteId ) );
				}, 1000 );
			} )
			.catch( ( error ) => {
				dispatch( transferInitiateFailure( siteId, error, plugin, context ) );
			} );
	};
}

// receive a transfer status
function transferStatus( siteId, transferId, status, message, themeId ) {
	return {
		type: THEME_TRANSFER_STATUS_RECEIVE,
		siteId,
		transferId,
		status,
		message,
		themeId,
	};
}

// receive a transfer status error
function transferStatusFailure( siteId, transferId, error ) {
	return {
		type: THEME_TRANSFER_STATUS_FAILURE,
		siteId,
		transferId,
		error,
	};
}

// receive a transfer initiation failure
function transferInitiateFailure( siteId, error, plugin, context ) {
	return ( dispatch ) => {
		const themeInitiateFailureAction = {
			type: THEME_TRANSFER_INITIATE_FAILURE,
			siteId,
			error,
		};
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_automated_transfer_initiate_failure', { plugin, context } ),
				themeInitiateFailureAction
			)
		);
	};
}
/**
 * Make API calls to the transfer status endpoint until a status complete is received,
 * or an error is received, or the timeout is reached.
 *
 * The returned promise is only for testing purposes, and therefore is never rejected,
 * to avoid unhandled rejections in production.
 * @param {number} siteId -- the site being transferred
 * @param {number} transferId -- the specific transfer
 * @param {number} [interval] -- time between poll attempts
 * @param {number} [timeout] -- time to wait for 'complete' status before bailing
 * @param {boolean} hasThemeFileUpload -- has theme File Upload
 * @returns {Promise} for testing purposes only
 */
export function pollThemeTransferStatus(
	siteId,
	transferId,
	interval = 3000,
	timeout = 240000,
	hasThemeFileUpload = false
) {
	const endTime = Date.now() + timeout;
	return ( dispatch ) => {
		const tryThemeFetch = ( uploaded_theme_slug, resolve ) => {
			wpcom.req.get( `/sites/${ siteId }/themes/mine`, { apiVersion: '1.1' } ).then( ( theme ) => {
				if ( theme.id === uploaded_theme_slug ) {
					dispatch( transferStatus( siteId, transferId, 'complete', '', uploaded_theme_slug ) );
					dispatch( {
						type: THEME_UPLOAD_SUCCESS,
						siteId,
						themeId: uploaded_theme_slug,
					} );
					// finished, stop polling
					return resolve();
				}

				if ( Date.now() < endTime ) {
					return setTimeout( tryThemeFetch, 1000, uploaded_theme_slug, resolve );
				}

				dispatch( transferStatusFailure( siteId, transferId, new Error() ) );
				resolve();
			} );
		};

		const pollStatus = ( resolve, reject ) => {
			if ( Date.now() > endTime ) {
				// timed-out, stop polling
				dispatch( transferStatusFailure( siteId, transferId, 'client timeout' ) );
				return resolve();
			}
			return wpcom.req
				.get( `/sites/${ siteId }/automated-transfers/status/${ transferId }` )
				.then( ( { status, message, uploaded_theme_slug } ) => {
					if ( ! hasThemeFileUpload ) {
						dispatch( transferStatus( siteId, transferId, status, message, uploaded_theme_slug ) );

						if ( status === 'complete' ) {
							// finished, stop polling
							return resolve();
						}

						// poll again
						return delay( pollStatus, interval, resolve, reject );
					}
					if ( status !== 'complete' ) {
						dispatch( transferStatus( siteId, transferId, status, message, uploaded_theme_slug ) );
						return delay( pollStatus, interval, resolve, reject );
					}

					tryThemeFetch( uploaded_theme_slug, resolve );
				} )
				.catch( ( error ) => {
					dispatch( transferStatusFailure( siteId, transferId, error ) );
					// error, stop polling
					return resolve();
				} );
		};
		return new Promise( pollStatus );
	};
}
