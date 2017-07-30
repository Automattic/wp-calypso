/**
 * Internal dependencies
 */
import {
	PERIODIC_ACTION_SUBSCRIBE,
	PERIODIC_ACTION_UNSUBSCRIBE
} from 'state/action-types';

/*
 * Object holding information related with the periodic actions to execute.
 */
const periodicActions = {};

/**
 * Handles the creation of the function used in setInterval
 *
 * @param   {function}   dispatch   redux dispatch function
 * @param   {object}     action     the dispatched action
 * @param   {function}   getState   redux getState function
 * @returns {function}              function passed to setInterval
 */
const getPeriodicFunction = ( dispatch, action, getState ) => {
	const visibilityChecker = action.pauseWhenHidden ? () => ! document.hidden : () => true;
	if ( action.skipChecker ) {
		return () => {
			if ( visibilityChecker() && ! action.skipChecker( getState() ) ) {
				dispatch( action.actionToExecute );
			}
		};
	}
	return () => {
		if ( visibilityChecker() ) {
			dispatch( action.actionToExecute );
		}
	};
};

/**
 * Handles the creation of a new periodic action
 *
 * @param {function} dispatch  redux dispatch function
 * @param {object}   action    the dispatched action
 * @param {function} getState  redux getState function
 */
const addPeriodicAction = ( dispatch, action, getState ) => {
	const periodicFunction = getPeriodicFunction( dispatch, action, getState );

	if ( action.executeOnStart ) {
		periodicFunction();
	}

	periodicActions[ action.periodicActionId ] = {
		interval: action.interval,
		intervalId: setInterval( periodicFunction, action.interval ),
		numberOfInterested: 1,
		pauseWhenHidden: action.pauseWhenHidden,
	};
};

/**
 * Handles the subscribe of a periodic action
 *
 * @param {function} dispatch  redux dispatch function
 * @param {object}   action    the dispatched action
 * @param {function} getState  redux getState function
 */
const periodicActionSubscribe = ( dispatch, action, getState ) => {
	const periodicAction = periodicActions[ action.periodicActionId ];
	if ( periodicAction ) {
		periodicAction.numberOfInterested += 1;
		if ( periodicAction.interval !== action.interval || periodicAction.pauseWhenHidden !== action.pauseWhenHidden ) {
			clearInterval( periodicAction.intervalId );
			periodicAction.interval = action.interval;
			periodicAction.intervalId = setInterval( getPeriodicFunction( dispatch, action, getState ), action.interval );
			periodicAction.pauseWhenHidden = action.pauseWhenHidden;
		}
	} else {
		addPeriodicAction( dispatch, action, getState );
	}
};

/**
 * Handles the unsubscribe of a periodic action
 *
 * @param {function} dispatch  redux dispatch function
 * @param {object}   action    the dispatched action
 */
const periodicActionUnSubscribe = ( dispatch, action ) => {
	const periodicAction = periodicActions[ action.periodicActionId ];
	if ( periodicAction ) {
		periodicAction.numberOfInterested -= 1;
		if ( periodicAction.numberOfInterested === 0 ) {
			clearInterval( periodicAction.intervalId );
			delete periodicActions[ action.periodicActionId ];
		}
	}
};

export const periodicActionsMiddleware = ( { dispatch, getState } ) => ( next ) => ( action ) => {
	switch ( action.type ) {
		case PERIODIC_ACTION_SUBSCRIBE:
			return periodicActionSubscribe( dispatch, action, getState );

		case PERIODIC_ACTION_UNSUBSCRIBE:
			return periodicActionUnSubscribe( dispatch, action, getState );

		default:
			return next( action );
	}
};

export default periodicActionsMiddleware;
