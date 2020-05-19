/**
 * Indicates if a Terms or Service update banner should be displayed.
 *
 * @param state {object}
 * @returns {boolean} Whether the ToS update banner should be displayed.
 */
export const shouldDisplayTosUpdateBanner = ( state ) => state?.legal?.tos?.displayPrompt === true;

export default shouldDisplayTosUpdateBanner;
