/**
 * Internal dependencies
 */
import { READER_SIDEBAR_LISTS_TOGGLE, READER_SIDEBAR_TAGS_TOGGLE } from 'state/action-types';

const stats = require( 'reader/stats' );

export function toggleReaderSidebarLists() {
	stats.recordAction( 'sidebar_toggle_lists_menu' );
	stats.recordGaEvent( 'Toggle Lists Menu' );
	return {
		type: READER_SIDEBAR_LISTS_TOGGLE
	};
}

export function toggleReaderSidebarTags() {
	stats.recordAction( 'sidebar_toggle_tags_menu' );
	stats.recordGaEvent( 'Toggle Tags Menu' );
	return {
		type: READER_SIDEBAR_TAGS_TOGGLE
	};
}
