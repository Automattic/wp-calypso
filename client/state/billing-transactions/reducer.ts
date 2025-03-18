import { withStorageKey } from '@automattic/state-utils';
import {
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import individualTransactions from './individual-transactions/reducer';
import { billingTransactionsSchema } from './schema';
import type { BillingTransactionsState, BillingTransactionsStateItems } from './types';
import type { AnyAction } from 'redux';

/**
 * Returns the updated items state after an action has been dispatched.
 * The state contains all past and upcoming billing transactions.
 */
export const items = withSchemaValidation(
	billingTransactionsSchema,
	( state: BillingTransactionsState[ 'items' ] = {}, action: AnyAction ) => {
		switch ( action.type ) {
			case BILLING_TRANSACTIONS_RECEIVE: {
				const { past, upcoming } = action;
				const update: BillingTransactionsStateItems = { ...state };
				if ( past ) {
					update.past = past;
				}
				if ( upcoming ) {
					update.upcoming = upcoming;
				}
				return update;
			}
		}

		return state;
	}
);

/**
 * Returns the updated requests state after an action has been dispatched.
 * The state contains whether a request for billing transactions is in progress.
 */
export const requesting = (
	state: BillingTransactionsState[ 'requesting' ] = false,
	action: AnyAction
) => {
	switch ( action.type ) {
		case BILLING_TRANSACTIONS_REQUEST:
			return true;
		case BILLING_TRANSACTIONS_REQUEST_FAILURE:
			return false;
		case BILLING_TRANSACTIONS_REQUEST_SUCCESS:
			return false;
	}

	return state;
};

const combinedReducer = combineReducers( {
	items,
	requesting,
	//individual transactions contains transactions that are not part of the items tree.
	//TODO: if pagination is implemented, address potential data duplication between individualTransactions and items
	individualTransactions,
} );

export default withStorageKey( 'billingTransactions', combinedReducer );
