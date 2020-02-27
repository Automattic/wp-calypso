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
	THEME_DELETE,
	THEME_DELETE_SUCCESS,
	THEME_DELETE_FAILURE,
	THEME_FILTERS_REQUEST,
	THEME_HIDE_AUTO_LOADING_HOMEPAGE_WARNING,
	THEME_SHOW_AUTO_LOADING_HOMEPAGE_WARNING,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE,
	THEME_UPLOAD_CLEAR,
	THEME_PREVIEW_OPTIONS,
	THEME_PREVIEW_STATE,
} from 'state/action-types';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import {
	getTheme,
	themeHasAutoLoadingHomepage,
	hasAutoLoadingHomepageModalAccepted,
} from 'state/themes/selectors';
import { getSiteTitle, isJetpackSite } from 'state/sites/selectors';
import i18n from 'i18n-calypso';
import accept from 'lib/accept';

import 'state/data-layer/wpcom/theme-filters';

import 'state/themes/init';

import { activateTheme } from 'state/themes/actions/activate-theme';
import { suffixThemeIdForInstall } from 'state/themes/actions/suffix-theme-id-for-install';
import { installAndActivateTheme } from 'state/themes/actions/install-and-activate-theme';

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

/**
 * Triggers a network request to activate a specific theme on a given site.
 * If it's a Jetpack site, installs the theme prior to activation if it isn't already.
 *
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @param  {string}   source    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased Whether the theme has been purchased prior to activation
 * @returns {Function}          Action thunk
 */
export function activate( themeId, siteId, source = 'unknown', purchased = false ) {
	return ( dispatch, getState ) => {
		/**
		 * Let's check if the theme will change the homepage of the site,
		 * before to definitely start the theme-activating process,
		 * allowing cancel it if it's desired.
		 */
		if (
			themeHasAutoLoadingHomepage( getState(), themeId ) &&
			! hasAutoLoadingHomepageModalAccepted( getState(), themeId )
		) {
			return dispatch( showAutoLoadingHomepageWarning( themeId ) );
		}

		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( getState(), siteId, themeId );
			// If theme is already installed, installation will silently fail,
			// and it will just be activated.
			return dispatch( installAndActivateTheme( installId, siteId, source, purchased ) );
		}

		return dispatch( activateTheme( themeId, siteId, source, purchased ) );
	};
}

/**
 * Clears any state remaining from a previous
 * theme upload to the given site.
 *
 * @param {number} siteId -- site to clear state for
 *
 * @returns {object} the action object to dispatch
 */
export function clearThemeUpload( siteId ) {
	return {
		type: THEME_UPLOAD_CLEAR,
		siteId,
	};
}

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

/**
 * Deletes a theme from the given Jetpack site.
 *
 * @param {string} themeId -- Theme to delete
 * @param {number} siteId -- Site to delete theme from
 *
 * @returns {Function} Action thunk
 */
export function deleteTheme( themeId, siteId ) {
	return dispatch => {
		dispatch( {
			type: THEME_DELETE,
			themeId,
			siteId,
		} );
		return wpcom
			.undocumented()
			.deleteThemeFromJetpack( siteId, themeId )
			.then( theme => {
				dispatch( {
					type: THEME_DELETE_SUCCESS,
					themeId,
					siteId,
					themeName: theme.name,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: THEME_DELETE_FAILURE,
					themeId,
					siteId,
					error,
				} );
			} );
	};
}

/**
 * Shows dialog asking user to confirm delete of theme
 * from jetpack site. Deletes theme if user confirms.
 *
 * @param {string} themeId -- Theme to delete
 * @param {number} siteId -- Site to delete theme from
 *
 * @returns {Function} Action thunk
 */
export function confirmDelete( themeId, siteId ) {
	return ( dispatch, getState ) => {
		const { name: themeName } = getTheme( getState(), siteId, themeId );
		const siteTitle = getSiteTitle( getState(), siteId );
		accept(
			i18n.translate( 'Are you sure you want to delete %(themeName)s from %(siteTitle)s?', {
				args: { themeName, siteTitle },
				comment: 'Themes: theme delete confirmation dialog',
			} ),
			accepted => {
				accepted && dispatch( deleteTheme( themeId, siteId ) );
			},
			i18n.translate( 'Delete %(themeName)s', {
				args: { themeName },
				comment: 'Themes: theme delete dialog confirm button',
			} ),
			i18n.translate( 'Back', { context: 'go back (like the back button in a browser)' } )
		);
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

export function showAutoLoadingHomepageWarning( themeId ) {
	return {
		type: THEME_SHOW_AUTO_LOADING_HOMEPAGE_WARNING,
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
