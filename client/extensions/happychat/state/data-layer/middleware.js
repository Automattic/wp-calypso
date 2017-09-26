/**
 * External dependencies
 */
import {
	has,
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	ANALYTICS_EVENT_RECORD,
} from 'state/action-types';

import {
	isHappychatClientConnected,
	isHappychatChatAssigned,
} from 'extensions/happychat/state/selectors';

export const getEventMessageFromTracksData = ( { name, properties } ) => {
	switch ( name ) {
		case 'calypso_add_new_wordpress_click':
			return 'Clicked "Add new site" button';
		case 'calypso_domain_search_add_button_click':
			return `Clicked "Add" button to add domain "${ properties.domain_name }"`;
		case 'calypso_domain_remove_button_click':
			return `Clicked "Remove" button to remove domain "${ properties.domain_name }"`;
		case 'calypso_themeshowcase_theme_activate':
			return `Changed theme from "${ properties.previous_theme }" to "${ properties.theme }"`;
		case 'calypso_editor_featured_image_upload':
			return 'Changed the featured image on the current post';
		case 'calypso_map_domain_step_add_domain_click':
			return `Add "${ properties.domain_name }" to the cart in the "Map a domain" step`;
	}
	return null;
};

export const sendAnalyticsLogEvent = ( connection, { meta: { analytics: analyticsMeta } } ) => {
	analyticsMeta.forEach( ( { type, payload: { service, name, properties } } ) => {
		if (
			type === ANALYTICS_EVENT_RECORD &&
			service === 'tracks'
		) {
			// Check if this event should generate a timeline event, and send it if so
			const eventMessage = getEventMessageFromTracksData( { name, properties } );
			if ( eventMessage ) {
				// Once we want these events to appear in production we should change this to sendEvent
				connection.sendEvent( eventMessage );
			}

			// Always send a log for every tracks event
			connection.sendLog( name );
		}
	} );
};

export const sendActionLogsAndEvents = ( connection, { getState }, action ) => {
	const state = getState();

	// If there's not an active Happychat session, do nothing
	if ( ! isHappychatClientConnected( state ) || ! isHappychatChatAssigned( state ) ) {
		return;
	}

	// If there's analytics metadata attached to this action, send analytics events
	if ( has( action, 'meta.analytics' ) ) {
		sendAnalyticsLogEvent( connection, action );
	}
};

export default function( connection = null ) {
	return store => next => action => {
		// Send any relevant log/event data from this action to Happychat
		sendActionLogsAndEvents( connection, store, action );

		return next( action );
	};
}
