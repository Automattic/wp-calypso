/**
 * Internal dependencies
 */
import { PREVIEW_IS_SHOWING, NAVIGATE, HISTORY_REPLACE } from 'state/action-types';

/**
 * Re-exports
 */
export { setSection, hideSidebar } from '../section/actions';
export { showMasterbar, hideMasterbar } from '../masterbar-visibility/actions';
export { setSelectedSiteId, setAllSitesSelected } from './set-sites';
export { toggleNotificationsPanel } from './notifications';

export function setPreviewShowing( isShowing ) {
	return {
		type: PREVIEW_IS_SHOWING,
		isShowing,
	};
}

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
