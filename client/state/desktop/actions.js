/**
 * Internal dependencies
 */
import { DESKTOP_NOTIFY_CANNOT_OPEN_EDITOR } from 'state/action-types';

/**
 * Notify the desktop that the editor cannot be opened.
 *
 * @param  {number} site  Site info from Redux state.
 * @param {string} reason Reason string describing the error. Current values are: `jetpack:sso`
 * @param {string} wpAdminLoginUrl  WP Admin URL to be used as a fallback.
 */
export const notifyDesktopCannotOpenEditor = ( site, reason, wpAdminLoginUrl ) => {
	return {
		type: DESKTOP_NOTIFY_CANNOT_OPEN_EDITOR,
		site,
		reason,
		wpAdminLoginUrl,
	};
};
