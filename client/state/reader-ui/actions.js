import {
	READER_VIEW_STREAM,
	READER_TRIGGERED_LOGGED_IN_ACTION,
	READER_CANCELLED_LOGGED_IN_ACTION,
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
export const triggeredLoggedInAction = ( name ) => ( {
	type: READER_TRIGGERED_LOGGED_IN_ACTION,
	name,
} );

/**
 * Dispatched when triggering an action that requires the user to be logged in.
 * @returns {Object} action object for dispatch
 */
export const cancelledLoggedInAction = () => ( {
	type: READER_CANCELLED_LOGGED_IN_ACTION,
} );
