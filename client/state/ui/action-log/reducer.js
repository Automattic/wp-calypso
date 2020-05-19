/**
 * External dependencies
 */

import { get, has, includes, isFunction, overSome, takeRight } from 'lodash';

/**
 * Internal dependencies
 */
import {
	EDITOR_PASTE_EVENT,
	FIRST_VIEW_HIDE,
	GUIDED_TOUR_UPDATE,
	PREVIEW_IS_SHOWING,
	ROUTE_SET,
	SITE_SETTINGS_RECEIVE,
} from 'state/action-types';
import { THEMES_REQUEST_SUCCESS } from 'state/themes/action-types';

const relevantAnalyticsEvents = [ 'calypso_themeshowcase_theme_click' ];

const relevantTypes = {
	// to catch all actions of a type:
	// ACTION_TYPE,
	// to catch actions of a type that match some criterion:
	// ACTION_TYPE: ( action ) => isValid( action.data )
	EDITOR_PASTE_EVENT,
	FIRST_VIEW_HIDE,
	GUIDED_TOUR_UPDATE,
	THEMES_REQUEST_SUCCESS,
	PREVIEW_IS_SHOWING,
	ROUTE_SET,
	SITE_SETTINGS_RECEIVE,
};

const hasRelevantAnalytics = ( action ) =>
	get( action, 'meta.analytics', [] ).some( ( record ) =>
		includes( relevantAnalyticsEvents, record.payload.name )
	);

const isRelevantActionType = ( action ) =>
	has( relevantTypes, action.type ) &&
	( ! isFunction( relevantTypes[ action.type ] ) || relevantTypes[ action.type ]( action ) );

const isRelevantAction = overSome( [ isRelevantActionType, hasRelevantAnalytics ] );

const newAction = ( action ) => ( {
	...action,
	timestamp: Date.now(),
} );

const maybeAdd = ( state, action ) => ( action ? takeRight( [ ...state, action ], 50 ) : state) ;

export default ( state = [], action ) =>
	isRelevantAction( action ) ? maybeAdd( state, newAction( action ) ) : state;
