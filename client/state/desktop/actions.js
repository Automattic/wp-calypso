/**
 * Internal dependencies
 */
import { CANNOT_USE_EDITOR } from 'state/action-types';

/**
 * Notify the desktop that the editor cannot be opened.
 *
 * @param  {object} site	Site info from Redux state.
 * @param {string} reason	Reason string describing the error.
 * @param {string} editorUrl	Editor URL being navigated to.
 * @param {string} wpAdminLoginUrl Fallback editor URL redirected from wpAdmin login.
 */
export const notifyDesktopCannotOpenEditor = ( site, reason, editorUrl, wpAdminLoginUrl ) => {
	return {
		type: CANNOT_USE_EDITOR,
		site,
		reason,
		editorUrl,
		wpAdminLoginUrl,
	};
};
