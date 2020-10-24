/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

/**
 * Get the high watermark for a Reader stream
 *
 * @param {object} state -
 * @param {string} streamKey -
 * @returns {number} date in number form
 */
export const getReaderWatermark = ( state, streamKey ) => state.reader.watermarks[ streamKey ];
