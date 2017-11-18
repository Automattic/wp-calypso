/**
 * @format
 */

/**
 * Get the high watermark for a Reader stream
 *
 * @param {Object} state -
 * @param {String} streamId -
 * @returns {Number} date in number form
 */
const getReaderWatermark = ( state, { streamId } ) => state.reader.watermarks[ streamId ];

export default getReaderWatermark;
