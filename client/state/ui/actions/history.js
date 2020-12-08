/**
 * Internal dependencies
 */
import { HISTORY_REPLACE } from 'calypso/state/action-types';

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
