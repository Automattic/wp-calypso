/**
 * Internal dependencies
 */
import { READER_VIEW_STREAM } from 'calypso/state/reader/action-types';

import 'calypso/state/reader/init';

/**
 * this is a relatively generic action type for something very specific (marking up the watermark)
 * My hope is that we'll be able to reuse this same action-type for many other functionalities.
 * i.e. unexpanding all photos/videos when opening a stream.
 *
 * @param {string} path  - current window location path
 * @param {Date} mark  - date last viewed
 * @param {string} streamKey - stream being viewed
 * @returns {object} action object for dispatch
 */

export const viewStream = ( { path, mark, streamKey } ) => {
	return {
		type: READER_VIEW_STREAM,
		path,
		mark,
		streamKey,
	};
};
