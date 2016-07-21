/**
 * External dependencies
 */
import { takeRight } from 'lodash';

/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_HIDE,
	GUIDED_TOUR_UPDATE,
	THEMES_RECEIVE,
	PREVIEW_IS_SHOWING,
	ROUTE_SET,
} from 'state/action-types';

const relevantTypes = {
	FIRST_VIEW_HIDE,
	GUIDED_TOUR_UPDATE,
	THEMES_RECEIVE,
	PREVIEW_IS_SHOWING,
	ROUTE_SET,
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
