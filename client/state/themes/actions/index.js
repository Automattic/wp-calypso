/* eslint-disable jsdoc/no-undefined-types */
/**
 * External dependencies
 */
import { delay } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	RECOMMENDED_THEMES_FAIL,
	RECOMMENDED_THEMES_FETCH,
	RECOMMENDED_THEMES_SUCCESS,
	THEME_ACCEPT_AUTO_LOADING_HOMEPAGE_WARNING,
	THEME_FILTERS_REQUEST,
	THEME_HIDE_AUTO_LOADING_HOMEPAGE_WARNING,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE,
	THEME_PREVIEW_OPTIONS,
	THEME_PREVIEW_STATE,
} from 'state/action-types';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

import 'state/data-layer/wpcom/theme-filters';

import 'state/themes/init';

export { setBackPath } from 'state/themes/actions/set-back-path';
export { receiveThemes } from 'state/themes/actions/receive-themes';
export { receiveTheme } from 'state/themes/actions/receive-theme';
export { requestThemes } from 'state/themes/actions/request-themes';
export { themeRequestFailure } from 'state/themes/actions/theme-request-failure';
export { requestTheme } from 'state/themes/actions/request-theme';
export { requestActiveTheme } from 'state/themes/actions/request-active-theme';
export { themeActivated } from 'state/themes/actions/theme-activated';
export { activateTheme } from 'state/themes/actions/activate-theme';
export { installTheme } from 'state/themes/actions/install-theme';
export { clearActivated } from 'state/themes/actions/clear-activated';
export { tryAndCustomizeTheme } from 'state/themes/actions/try-and-customize-theme';
export { installAndTryAndCustomizeTheme } from 'state/themes/actions/install-and-try-and-customize-theme';
export { tryAndCustomize } from 'state/themes/actions/try-and-customize';
export { installAndActivateTheme } from 'state/themes/actions/install-and-activate-theme';
export { uploadTheme } from 'state/themes/actions/upload-theme';
export { clearThemeUpload } from 'state/themes/actions/clear-theme-upload';
export { deleteTheme } from 'state/themes/actions/delete-theme';
export { confirmDelete } from 'state/themes/actions/confirm-delete';
export { showAutoLoadingHomepageWarning } from 'state/themes/actions/show-auto-loading-homepage-warning';
export { activate } from 'state/themes/actions/activate';

/**
 * Start an Automated Transfer with an uploaded theme.
 *
 * @param {number} siteId -- the site to transfer
 * @param {File} file -- theme zip to upload
 * @param {string} plugin -- plugin slug
 *
 * @returns {Promise} for testing purposes only
 */
export function initiateThemeTransfer( siteId, file, plugin ) {
	let context = plugin ? 'plugins' : 'themes';
	if ( ! plugin && ! file ) {
		context = 'hosting';
	}

	return dispatch => {
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
			.initiateTransfer( siteId, plugin, file, event => {
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
			.catch( error => {
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
	return dispatch => {
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
	return dispatch => {
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
				.catch( error => {
					dispatch( transferStatusFailure( siteId, transferId, error ) );
					// error, stop polling
					return resolve();
				} );
		};
		return new Promise( pollStatus );
	};
}

export function setThemePreviewOptions( primary, secondary ) {
	return {
		type: THEME_PREVIEW_OPTIONS,
		primary,
		secondary,
	};
}

export function showThemePreview( themeId ) {
	return {
		type: THEME_PREVIEW_STATE,
		themeId,
	};
}

export function hideAutoLoadingHomepageWarning() {
	return {
		type: THEME_HIDE_AUTO_LOADING_HOMEPAGE_WARNING,
	};
}

export function acceptAutoLoadingHomepageWarning( themeId ) {
	return {
		type: THEME_ACCEPT_AUTO_LOADING_HOMEPAGE_WARNING,
		themeId,
	};
}

export function hideThemePreview() {
	return {
		type: THEME_PREVIEW_STATE,
		themeId: null,
	};
}

/**
 * Triggers a network request to fetch all available theme filters.
 *
 * @returns {object} A nested list of theme filters, keyed by filter slug
 */
export function requestThemeFilters() {
	return {
		type: THEME_FILTERS_REQUEST,
	};
}

/**
 * Receives themes and dispatches them with recommended themes success signal.
 *
 * @param {Array} themes array of received theme objects
 * @returns {Function} Action thunk
 */
export function receiveRecommendedThemes( themes ) {
	return dispatch => {
		dispatch( { type: RECOMMENDED_THEMES_SUCCESS, payload: themes } );
	};
}

/**
 * Initiates network request for recommended themes.
 * Recommended themes are template first themes and are denoted by the 'auto-loading-homepage' tag.
 *
 * @returns {Function} Action thunk
 */
export function getRecommendedThemes() {
	return async dispatch => {
		dispatch( { type: RECOMMENDED_THEMES_FETCH } );
		const query = {
			search: '',
			number: 50,
			tier: '',
			filter: 'auto-loading-homepage',
			apiVersion: '1.2',
		};
		try {
			const res = await wpcom.undocumented().themes( null, query );
			dispatch( receiveRecommendedThemes( res ) );
		} catch ( error ) {
			dispatch( { type: RECOMMENDED_THEMES_FAIL } );
		}
	};
}
