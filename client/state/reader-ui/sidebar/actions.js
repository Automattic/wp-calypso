import { recordAction, recordGaEvent, recordTrack } from 'calypso/reader/stats';
import {
	READER_SIDEBAR_LISTS_TOGGLE,
	READER_SIDEBAR_TAGS_TOGGLE,
	READER_SIDEBAR_ORGANIZATIONS_TOGGLE,
	READER_SIDEBAR_FOLLOWING_TOGGLE,
	READER_SIDEBAR_SELECT_RECENT_SITE,
} from 'calypso/state/reader-ui/action-types';

import 'calypso/state/reader-ui/init';

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

export function toggleReaderSidebarOrganization( { organizationId } ) {
	recordAction( 'sidebar_toggle_organization_menu' );
	recordGaEvent( 'Toggle Organizations Menu' );
	recordTrack( 'calypso_reader_sidebar_organization_toggle' );
	return {
		type: READER_SIDEBAR_ORGANIZATIONS_TOGGLE,
		organizationId,
	};
}

export function toggleReaderSidebarFollowing() {
	recordAction( 'sidebar_toggle_following_menu' );
	recordGaEvent( 'Toggle Following Menu' );
	recordTrack( 'calypso_reader_sidebar_following_toggle' );
	return {
		type: READER_SIDEBAR_FOLLOWING_TOGGLE,
	};
}

/**
 * Creates a dispatchable action that reflects the site selected in the Recent sidebar section.
 * @param {Object} params - The parameters for selecting a recent site.
 * @param {number|null} params.feedId - The ID of the feed to select.
 * @returns The action object to dispatch.
 */

export function selectSidebarRecentSite( { feedId } ) {
	// TODO: Determine if tracking is needed here
	return {
		type: READER_SIDEBAR_SELECT_RECENT_SITE,
		feedId,
	};
}
