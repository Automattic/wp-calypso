/**
 * External dependencies
 */
import { has, noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ANALYTICS_EVENT_RECORD,
	HELP_CONTACT_FORM_SITE_SELECT,
	ROUTE_SET,
	COMMENTS_CHANGE_STATUS,
	EXPORT_COMPLETE,
	EXPORT_FAILURE,
	EXPORT_STARTED,
	HAPPYCHAT_IO_RECEIVE_STATUS,
	IMPORTS_IMPORT_START,
	MEDIA_DELETE,
	PLUGIN_ACTIVATE_REQUEST,
	PLUGIN_SETUP_ACTIVATE,
	POST_SAVE_SUCCESS,
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	PURCHASE_REMOVE_COMPLETED,
	SITE_SETTINGS_SAVE_SUCCESS,
} from 'state/action-types';
import { JETPACK_CONNECT_AUTHORIZE } from 'state/jetpack-connect/action-types';
import {
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_PENDING,
} from 'state/happychat/constants';
import { sendEvent, sendLog, sendPreferences } from 'state/happychat/connection/actions';
import getHappychatChatStatus from 'state/happychat/selectors/get-happychat-chat-status';
import getGroups from 'state/happychat/selectors/get-groups';
import getSkills from 'state/happychat/selectors/get-skills';
import isHappychatChatAssigned from 'state/happychat/selectors/is-happychat-chat-assigned';
import isHappychatClientConnected from 'state/happychat/selectors/is-happychat-client-connected';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import getCurrentRoute from 'state/selectors/get-current-route';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

const getRouteSetMessage = ( state, path ) => {
	return `Looking at https://wordpress.com${ path }`;
};

export const getEventMessageFromActionData = ( action ) => {
	// Below we've stubbed in the actions we think we'll care about, so that we can
	// start incrementally adding messages for them.
	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
			return `Changed a comment's status to "${ action.status }"`;
		case EXPORT_COMPLETE:
			return 'Export completed';
		case EXPORT_FAILURE:
			return `Export failed: ${ action.error.message }`;
		case EXPORT_STARTED:
			return 'Started an export';
		case IMPORTS_IMPORT_START: // This one seems not to fire at all.
			return null;
		case JETPACK_CONNECT_AUTHORIZE:
			return null;
		case MEDIA_DELETE: // This one seems not to fire at all.
			return null;
		case PLUGIN_ACTIVATE_REQUEST:
			return null;
		case PLUGIN_SETUP_ACTIVATE:
			return null;
		case POST_SAVE_SUCCESS:
			return `Saved post "${ action.savedPost.title }" ${ action.savedPost.short_URL }`;
		case PUBLICIZE_CONNECTION_CREATE:
			return `Connected ${ action.connection.label } sharing`;
		case PUBLICIZE_CONNECTION_DELETE:
			return `Disconnected ${ action.connection.label } sharing`;
		case PURCHASE_REMOVE_COMPLETED:
			return null;
		case SITE_SETTINGS_SAVE_SUCCESS:
			return 'Saved site settings';
	}
	return null;
};

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
		case 'calypso_view_site_page_view':
			return `Looking at ${ properties.full_url } inside the View Site section`;
	}
	return null;
};

export const sendAnalyticsLogEvent = ( dispatch, { meta: { analytics: analyticsMeta } } ) => {
	analyticsMeta.forEach( ( { type, payload: { service, name, properties } } ) => {
		if ( type === ANALYTICS_EVENT_RECORD && service === 'tracks' ) {
			// Check if this event should generate a timeline event, and send it if so
			const eventMessage = getEventMessageFromTracksData( { name, properties } );
			if ( eventMessage ) {
				// Once we want these events to appear in production we should change this to sendEvent
				dispatch( sendEvent( eventMessage ) );
			}

			// Always send a log for every tracks event
			dispatch( sendLog( name ) );
		}
	} );
};

export const sendActionLogsAndEvents = ( { getState, dispatch }, action ) => {
	const state = getState();

	// If there's not an active Happychat session, do nothing
	if ( ! isHappychatClientConnected( state ) || ! isHappychatChatAssigned( state ) ) {
		return;
	}

	// If there's analytics metadata attached to this action, send analytics events
	if ( has( action, 'meta.analytics' ) ) {
		sendAnalyticsLogEvent( dispatch, action );
	}

	// Check if this action should generate a timeline event, and send it if so
	const eventMessage = getEventMessageFromActionData( action );
	if ( eventMessage ) {
		// Once we want these events to appear in production we should change this to sendEvent
		dispatch( sendEvent( eventMessage ) );
	}
};

export default ( store ) => ( next ) => ( action ) => {
	const state = store.getState();
	const { dispatch } = store;

	// Send any relevant log/event data from this action to Happychat
	sendActionLogsAndEvents( store, action );

	switch ( action.type ) {
		case HAPPYCHAT_IO_RECEIVE_STATUS:
			// When the Happychat chat status transitions from "pending" to "assigned", this indicates
			// a chat has just started. Send the current route to the operator for context on where
			// the customer initiated their chat request from.
			if (
				getHappychatChatStatus( state ) === HAPPYCHAT_CHAT_STATUS_PENDING &&
				action.status === HAPPYCHAT_CHAT_STATUS_ASSIGNED
			) {
				dispatch(
					withAnalytics(
						recordTracksEvent( 'calypso_happychat_start' ),
						sendEvent( getRouteSetMessage( state, getCurrentRoute( state ) ) )
					)
				);
			}
			break;

		case HELP_CONTACT_FORM_SITE_SELECT:
			if ( isHappychatClientConnected( state ) ) {
				const locales = getCurrentUserLocale( state );
				const groups = getGroups( state, action.siteId );
				const skills = getSkills( state, action.siteId );

				dispatch( sendPreferences( locales, groups, skills ) );
			}
			break;

		case ROUTE_SET:
			isHappychatClientConnected( state ) && isHappychatChatAssigned( state )
				? dispatch( sendEvent( getRouteSetMessage( state, action.path ) ) )
				: noop;
			break;
	}
	return next( action );
};
