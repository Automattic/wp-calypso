/**
 * External dependencies
 */
import { delay } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE,
} from 'state/themes/action-types';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

import 'state/themes/init';

/**
 * Start an Automated Transfer with an uploaded theme.
 *
 * @param {number} siteId -- the site to transfer
 * @param {window.File} file -- theme zip to upload
 * @param {string} plugin -- plugin slug
 *
 * @returns {Promise} for testing purposes only
 */
export function initiateThemeTransfer( siteId, file, plugin ) {
	let context = plugin ? 'plugins' : 'themes';
	if ( ! plugin && ! file ) {
		context = 'hosting';
	}

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
		return wpcom
			.undocumented()
			.initiateTransfer( siteId, plugin, file, ( event ) => {
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
				dispatch( pollThemeTransferStatus( siteId, transfer_id, context ) );
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
 *
 * @param {number} siteId -- the site being transferred
 * @param {number} transferId -- the specific transfer
 * @param {string} context -- from which the transfer was initiated
 * @param {number} [interval] -- time between poll attempts
 * @param {number} [timeout] -- time to wait for 'complete' status before bailing
 *
 * @returns {Promise} for testing purposes only
 */
export function pollThemeTransferStatus(
	siteId,
	transferId,
	context,
	interval = 3000,
	timeout = 180000
) {
	const endTime = Date.now() + timeout;
	return ( dispatch ) => {
		const pollStatus = ( resolve, reject ) => {
			if ( Date.now() > endTime ) {
				// timed-out, stop polling
				dispatch( transferStatusFailure( siteId, transferId, 'client timeout' ) );
				return resolve();
			}
			return wpcom
				.undocumented()
				.transferStatus( siteId, transferId )
				.then( ( { status, message, uploaded_theme_slug } ) => {
					dispatch( transferStatus( siteId, transferId, status, message, uploaded_theme_slug ) );
					if ( status === 'complete' ) {
						// finished, stop polling
						dispatch(
							recordTracksEvent( 'calypso_automated_transfer_complete', {
								transfer_id: transferId,
								context,
							} )
						);
						return resolve();
					}
					// poll again
					return delay( pollStatus, interval, resolve, reject );
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
