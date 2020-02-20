/**
 * Internal dependencies
 */

import { READER_SIDEBAR_LISTS_TOGGLE, READER_SIDEBAR_TAGS_TOGGLE } from 'state/action-types';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

export function toggleReaderSidebarLists() {
	recordAction( 'sidebar_toggle_lists_menu' );
	recordGaEvent( 'Toggle Lists Menu' );
	recordTrack( 'calypso_reader_sidebar_list_toggle' );
	return {
		type: READER_SIDEBAR_LISTS_TOGGLE,
	};
}

export function toggleReaderSidebarTags() {
	recordAction( 'sidebar_toggle_tags_menu' );
	recordGaEvent( 'Toggle Tags Menu' );
	recordTrack( 'calypso_reader_sidebar_tags_toggle' );
	return {
		type: READER_SIDEBAR_TAGS_TOGGLE,
	};
}
