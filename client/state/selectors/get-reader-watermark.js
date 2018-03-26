/** @format */

/**
 * Get the high watermark for a Reader stream
 *
 * @param {Object} state -
 * @param {String} streamKey -
 * @returns {Number} date in number form
 */
const getReaderWatermark = ( state, streamKey ) => state.reader.watermarks[ streamKey ];

export default getReaderWatermark;
