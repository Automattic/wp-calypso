/**
 * External dependencies
 */
import { get, has, includes, overSome } from 'lodash';

/**
 * Internal dependencies
 */
import { GUIDED_TOUR_UPDATE, ROUTE_SET, SITE_SETTINGS_RECEIVE } from 'calypso/state/action-types';
import { THEMES_REQUEST_SUCCESS } from 'calypso/state/themes/action-types';

const relevantAnalyticsEvents = [ 'calypso_themeshowcase_theme_click' ];

const relevantTypes = {
	// to catch all actions of a type:
	// ACTION_TYPE,
	// to catch actions of a type that match some criterion:
	// ACTION_TYPE: ( action ) => isValid( action.data )
	GUIDED_TOUR_UPDATE,
	THEMES_REQUEST_SUCCESS,
	ROUTE_SET,
	SITE_SETTINGS_RECEIVE,
};

const hasRelevantAnalytics = ( action ) =>
	get( action, 'meta.analytics', [] ).some( ( record ) =>
		includes( relevantAnalyticsEvents, record.payload.name )
	);

const isRelevantActionType = ( action ) =>
	has( relevantTypes, action.type ) &&
	( typeof relevantTypes[ action.type ] !== 'function' || relevantTypes[ action.type ]( action ) );

const isRelevantAction = overSome( [ isRelevantActionType, hasRelevantAnalytics ] );

const newAction = ( action ) => ( {
	...action,
	timestamp: Date.now(),
} );

const maybeAdd = ( state, action ) => ( action ? [ ...state, action ].slice( -50 ) : state );

export default ( state = [], action ) =>
	isRelevantAction( action ) ? maybeAdd( state, newAction( action ) ) : state;
