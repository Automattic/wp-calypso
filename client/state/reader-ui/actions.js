/**
 * Internal dependencies
 */
import { READER_VIEW_STREAM } from 'calypso/state/reader/action-types';

import 'calypso/state/reader-ui/init';

/**
 * Dispatched when viewing a stream.
 *
 * @param {string} streamKey - stream being viewed
 * @param {string} path  - current window location path
 * @returns {object} action object for dispatch
 */
export const viewStream = ( streamKey, path ) => ( {
	type: READER_VIEW_STREAM,
	path,
	streamKey,
} );
