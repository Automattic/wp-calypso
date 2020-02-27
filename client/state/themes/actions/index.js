/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	RECOMMENDED_THEMES_FAIL,
	RECOMMENDED_THEMES_FETCH,
	RECOMMENDED_THEMES_SUCCESS,
	THEME_FILTERS_REQUEST,
	THEME_PREVIEW_STATE,
} from 'state/action-types';

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
export {
	initiateThemeTransfer,
	pollThemeTransferStatus,
} from 'state/themes/actions/theme-transfer';
export { setThemePreviewOptions } from 'state/themes/actions/set-theme-preview-options';
export { showThemePreview } from 'state/themes/actions/show-theme-preview';
export { hideAutoLoadingHomepageWarning } from 'state/themes/actions/hide-auto-loading-homepage-warning';
export { acceptAutoLoadingHomepageWarning } from 'state/themes/actions/accept-auto-loading-homepage-warning';

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
