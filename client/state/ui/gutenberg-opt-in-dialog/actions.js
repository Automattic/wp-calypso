/** @format */

/**
 * Internal dependencies
 */
import { GUTENBERG_OPT_IN, GUTENBERG_OPT_IN_DIALOG_IS_SHOWING } from 'state/action-types';

export function showGutenbergOptInDialog() {
	return {
		type: GUTENBERG_OPT_IN_DIALOG_IS_SHOWING,
		isShowing: true,
	};
}

export function hideGutenbergOptInDialog() {
	return {
		type: GUTENBERG_OPT_IN_DIALOG_IS_SHOWING,
		isShowing: false,
	};
}

export function optInToGutenberg() {
	return {
		type: GUTENBERG_OPT_IN,
		hasOptedIn: true,
	};
}

export function optOutOfGutenberg() {
	return {
		type: GUTENBERG_OPT_IN,
		hasOptedIn: false,
	};
}
