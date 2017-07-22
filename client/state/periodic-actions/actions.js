/**
 * Internal dependencies
 */
import {
	PERIODIC_ACTION_SUBSCRIBE,
	PERIODIC_ACTION_UNSUBSCRIBE
} from 'state/action-types';

/**
 * Creates the action to start a periodic subscribe
 *
 * @param   {String}    periodicActionId  Unique identifier of the periodic action
 * @param   {Object}    actionToExecute   Redux action to be executed periodically
 * @param   {Number}    interval          Interval between executions of the periodic action
 * @param   {?function} skipChecker       Function that receives the redux state and if returns true the periodic execution is skipped
 * @param   {?Boolean}  pauseWhenHidden   If true the periodic action is not dispatched if tab is not visible
 * @param   {?Boolean}  executeOnStart    If true the periodic action is dispatched immediately once subscribe is made
 * @returns {Object}                      Redux action that represents the periodic subscription
 */
export const periodicActionSubscribe = ( periodicActionId, actionToExecute, interval, skipChecker, pauseWhenHidden, executeOnStart ) => ( {
	type: PERIODIC_ACTION_SUBSCRIBE,
	periodicActionId,
	actionToExecute,
	interval,
	skipChecker,
	pauseWhenHidden,
	executeOnStart,
} );

/**
 * Creates the action to unsubscribe (remove interest) in a periodic action
 *
 * @param   {String}    periodicActionId  Unique identifier of the periodic action
 * @returns {Object}                      Redux action that represents the unsubscribe of a periodic action
 */
export const periodicActionUnSubscribe = ( periodicActionId ) => ( {
	type: PERIODIC_ACTION_UNSUBSCRIBE,
	periodicActionId
} );
