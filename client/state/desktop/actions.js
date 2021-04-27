/**
 * Internal dependencies
 */
import { EDITOR_VIEW_POST_CLICKED, SEND_TO_PRINTER } from 'calypso/state/action-types';

/**
 * Notify the desktop that the "View Post" button has been clicked.
 *
 * @param {string} url The URL being navigated to.
 */
export const notifyDesktopViewPostClicked = ( url ) => {
	return {
		type: EDITOR_VIEW_POST_CLICKED,
		url,
	};
};

/**
 * Notify the desktop the user has triggered a print action.
 *
 * @param {string} title The title of the content being printed.
 * @param {string} contents The contents being printed.
 */
export const notifyDesktopSendToPrinter = ( title, contents ) => {
	return {
		type: SEND_TO_PRINTER,
		title,
		contents,
	};
};
