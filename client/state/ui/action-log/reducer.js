/**
 * External dependencies
 */
import { get, has, includes, isFunction, takeRight } from 'lodash';

/**
 * Internal dependencies
 */
import {
	EDITOR_PASTE_EVENT,
	FIRST_VIEW_HIDE,
	GUIDED_TOUR_UPDATE,
	THEMES_REQUEST_SUCCESS,
	PREVIEW_IS_SHOWING,
	ROUTE_SET,
	SITE_SETTINGS_RECEIVE,
} from 'state/action-types';

const relevantAnalyticsEvents = [
	'calypso_themeshowcase_theme_click',
];

const relevantTypes = {
	ANALYTICS_EVENT_RECORD: isRelevantAnalytics,
	EDITOR_PASTE_EVENT,
	FIRST_VIEW_HIDE,
	GUIDED_TOUR_UPDATE,
	THEMES_REQUEST_SUCCESS,
	PREVIEW_IS_SHOWING,
	ROUTE_SET,
	SITE_SETTINGS_RECEIVE,
};

const isRelevantAction = ( action ) =>
	has( relevantTypes, action.type ) && (
		! isFunction( relevantTypes[ action.type ] ) ||
		relevantTypes[ action.type ]( action ) );

function isRelevantAnalytics( action ) {
	return get( action, 'meta.analytics', [] ).some( record =>
		includes( relevantAnalyticsEvents, record.payload.name ) );
}

const newAction = ( action ) => ( {
	...action, timestamp: Date.now()
} );

const maybeAdd = ( state, action ) =>
	action
		? takeRight( [ ...state, action ], 50 )
		: state;

export default ( state = [], action ) =>
	isRelevantAction( action )
		? maybeAdd( state, newAction( action ) )
		: state;
