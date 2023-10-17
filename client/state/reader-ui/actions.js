import {
	READER_VIEW_STREAM,
	READER_REGISTER_LAST_LOGGED_IN_ACTION,
	READER_CLEAR_LAST_LOGGED_IN_ACTION,
} from 'calypso/state/reader-ui/action-types';

import 'calypso/state/reader-ui/init';

/**
 * Dispatched when viewing a stream.
 * @param {string} streamKey - stream being viewed
 * @param {string} path  - current window location path
 * @returns {Object} action object for dispatch
 */
export const viewStream = ( streamKey, path ) => ( {
	type: READER_VIEW_STREAM,
	path,
	streamKey,
} );

/**
 * Dispatched when triggering an action that requires the user to be logged in.
 * @param {string} name - name of the action that requires user to be logged in to access
 * @returns {Object} action object for dispatch
 */
export const registerLastLoggedInAction = ( name ) => ( {
	type: READER_REGISTER_LAST_LOGGED_IN_ACTION,
	name,
} );

/**
 * Dispatched when we want to clear the last action that requires the user to be logged in.
 * @returns {Object} action object for dispatch
 */
export const clearLastLoggedInAction = () => ( {
	type: READER_CLEAR_LAST_LOGGED_IN_ACTION,
} );
