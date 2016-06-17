
/**
 * External dependencies
 */
import includes from 'lodash/includes';
import omit from 'lodash/omit';
import takeRight from 'lodash/takeRight';

/**
 * Internal dependencies
 */
import {
	GUIDED_TOUR_SHOW,
	GUIDED_TOUR_UPDATE,
	SET_ROUTE,
	THEMES_RECEIVE,
	PREVIEW_IS_SHOWING,
} from 'state/action-types';

export function guidedTour( state = {}, action ) {
	switch ( action.type ) {
		case GUIDED_TOUR_SHOW:
			const { stepName = 'init' } = action;
			return {
				stepName,
				shouldShow: action.shouldShow,
				shouldDelay: action.shouldDelay,
				shouldReallyShow: ( action.shouldShow || state.shouldShow ) && ! action.shouldDelay,
				tour: action.tour,
			};
		case GUIDED_TOUR_UPDATE:
			return { ...state, ...omit( action, 'type' ) };
	}
	return state;
}

/*****/

//const triggerFactories = [
//	{
//		type: SET_ROUTE,
//		factory: ( action ) =>
//];

const isRelevantTrigger = includes.bind( null, [
	SET_ROUTE,
	GUIDED_TOUR_SHOW,
	GUIDED_TOUR_UPDATE,
	THEMES_RECEIVE,
	PREVIEW_IS_SHOWING,
] );

const toTrigger = ( action ) => ( {
	...action, timestamp: Date.now()
} );

export function tourTriggers( state = [], action ) {
	return isRelevantTrigger( action.type )
		? takeRight( [ ...state, toTrigger( action ) ], 50 )
		: state;
}

/*****/

export default guidedTour;
