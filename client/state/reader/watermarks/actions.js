/**
 * Internal dependencies
 */
import { READER_VIEW_STREAM } from 'state/action-types';

/**
 * this is a relatively generic action type for something very specific (marking up the watermark)
 * My hope is that we'll be able to reuse this same action-type for many other functionalities.
 * i.e. unexpanding all photos/videos when opening a stream.
 *
 * @param {Date} mark  - date last viewed
 * @param {string} streamKey - stream being viewed
 * @returns {object} action object for dispatch
 */
export const viewStream = ( { mark, streamKey } ) => {
	return {
		type: READER_VIEW_STREAM,
		mark,
		streamKey,
	};
};
