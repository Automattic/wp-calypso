import {
	INLINE_HELP_SET_SEARCH_QUERY,
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_POPOVER_HIDE,
} from 'calypso/state/action-types';
import 'calypso/state/inline-help/init';

/**
 * Set the search query in the state tree for the inline help.
 *
 * @param {string} searchQuery - query string to persist.
 * @returns {Function}            Action thunk.
 */
export function setInlineHelpSearchQuery( searchQuery = '' ) {
	return {
		type: INLINE_HELP_SET_SEARCH_QUERY,
		searchQuery,
	};
}

export function showInlineHelpPopover() {
	return {
		type: INLINE_HELP_POPOVER_SHOW,
	};
}

export function hideInlineHelpPopover() {
	return {
		type: INLINE_HELP_POPOVER_HIDE,
	};
}
