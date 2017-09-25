/**
 * Internal dependencies
 */
import { READER_SIDEBAR_LISTS_TOGGLE, READER_SIDEBAR_TAGS_TOGGLE } from 'state/action-types';

import stats from 'reader/stats';

export function toggleReaderSidebarLists() {
	stats.recordAction( 'sidebar_toggle_lists_menu' );
	stats.recordGaEvent( 'Toggle Lists Menu' );
	stats.recordTrack( 'calypso_reader_sidebar_list_toggle' );
	return {
		type: READER_SIDEBAR_LISTS_TOGGLE
	};
}

export function toggleReaderSidebarTags() {
	stats.recordAction( 'sidebar_toggle_tags_menu' );
	stats.recordGaEvent( 'Toggle Tags Menu' );
	stats.recordTrack( 'calypso_reader_sidebar_tags_toggle' );
	return {
		type: READER_SIDEBAR_TAGS_TOGGLE
	};
}
