/**
 * Internal dependencies
 */

import {
	MEMBERSHIPS_SUBSCRIPTIONS_RECEIVE,
	MEMBERSHIPS_SUBSCRIPTION_STOP,
	MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
	MEMBERSHIPS_SUBSCRIPTION_STOP_FAILURE,
} from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';

/**
 * Returns the updated items state after an action has been dispatched.
 * The state contains all past and upcoming billing transactions.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withoutPersistence( ( state = [], action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_SUBSCRIPTIONS_RECEIVE: {
			const { subscriptions } = action;
			return subscriptions;
		}
		case MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS: {
			const { subscriptionId } = action;
			return state.filter( ( sub ) => sub.ID !== subscriptionId );
		}
	}

	return state;
} );

export const stoppingSubscription = withoutPersistence( ( state = [], action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_SUBSCRIPTION_STOP: {
			const { subscriptionId } = action;

			return {
				...state,
				[ subscriptionId ]: 'start',
			};
		}
		case MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS: {
			const { subscriptionId } = action;

			return {
				...state,
				[ subscriptionId ]: 'success',
			};
		}
		case MEMBERSHIPS_SUBSCRIPTION_STOP_FAILURE: {
			const { subscriptionId } = action;

			return {
				...state,
				[ subscriptionId ]: 'fail',
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	stoppingSubscription,
} );
