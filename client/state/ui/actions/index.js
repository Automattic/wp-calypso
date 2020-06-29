/**
 * Internal dependencies
 */
import {
	PREVIEW_IS_SHOWING,
	NOTIFICATIONS_PANEL_TOGGLE,
	NAVIGATE,
	HISTORY_REPLACE,
} from 'state/action-types';

/**
 * Re-exports
 */
export { setSection, hideSidebar } from '../section/actions';
export { showMasterbar, hideMasterbar } from '../masterbar-visibility/actions';
export { setSelectedSiteId, setAllSitesSelected } from './set-sites';

export function setPreviewShowing( isShowing ) {
	return {
		type: PREVIEW_IS_SHOWING,
		isShowing,
	};
}

/**
 * Sets ui state to toggle the notifications panel
 *
 * @returns {object} An action object
 */
export const toggleNotificationsPanel = () => {
	return {
		type: NOTIFICATIONS_PANEL_TOGGLE,
	};
};

/**
 * Returns an action object signalling navigation to the given path.
 *
 * @param  {string} path Navigation path
 * @returns {object}      Action object
 */
export const navigate = ( path ) => ( { type: NAVIGATE, path } );

/**
 * Replaces the current url and modifies the browser history entry. Equivalent to window.replaceHistory
 *
 * @param {string} path Navigation path
 * @param {boolean} saveContext true if we should save the current page.js context
 * @returns {object} Action object
 */
export const replaceHistory = ( path, saveContext ) => ( {
	type: HISTORY_REPLACE,
	path,
	saveContext,
} );
