/**
 * External dependencies
 */
import { takeRight } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMPONENT_INTERACTION_TRACKED,
	EDITOR_PASTE_EVENT,
	FIRST_VIEW_HIDE,
	GUIDED_TOUR_UPDATE,
	THEMES_REQUEST_SUCCESS,
	PREVIEW_IS_SHOWING,
	ROUTE_SET,
	SITE_SETTINGS_RECEIVE,
} from 'state/action-types';

const relevantTypes = {
	COMPONENT_INTERACTION_TRACKED,
	EDITOR_PASTE_EVENT,
	FIRST_VIEW_HIDE,
	GUIDED_TOUR_UPDATE,
	THEMES_REQUEST_SUCCESS,
	PREVIEW_IS_SHOWING,
	ROUTE_SET,
	SITE_SETTINGS_RECEIVE,
};

const isRelevantAction = ( action ) =>
	relevantTypes.hasOwnProperty( action.type ) &&
	( typeof relevantTypes[ action.type ] !== 'function' ||
		relevantTypes[ action.type ]( action ) );

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
