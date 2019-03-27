/** @format */
/**
 * Internal dependencies
 */

export const isCalypsoifyGutenbergEnabled = ( state, siteId ) => {
	// Return false since we want the iframed block editor for all platforms.
	// TODO: Remove the selector and all instances in a followup PR.
	return false;
};

export default isCalypsoifyGutenbergEnabled;
