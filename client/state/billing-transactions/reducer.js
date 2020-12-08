/**
 * Internal dependencies
 */
import {
	BILLING_RECEIPT_EMAIL_SEND,
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import {
	combineReducers,
	withoutPersistence,
	withSchemaValidation,
	withStorageKey,
} from 'calypso/state/utils';
import { billingTransactionsSchema } from './schema';
import individualTransactions from './individual-transactions/reducer';
import ui from './ui/reducer';

/**
 * Returns the updated items state after an action has been dispatched.
 * The state contains all past and upcoming billing transactions.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( billingTransactionsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case BILLING_TRANSACTIONS_RECEIVE: {
			const { past, upcoming } = action;
			return { past, upcoming };
		}
	}

	return state;
} );

/**
 * Returns the updated requests state after an action has been dispatched.
 * The state contains whether a request for billing transactions is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case BILLING_TRANSACTIONS_REQUEST:
			return true;
		case BILLING_TRANSACTIONS_REQUEST_FAILURE:
			return false;
		case BILLING_TRANSACTIONS_REQUEST_SUCCESS:
			return false;
	}

	return state;
} );

/**
 * Returns the updated sending email requests state after an action has been dispatched.
 * The state contains whether a request for sending a receipt email is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const sendingReceiptEmail = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case BILLING_RECEIPT_EMAIL_SEND: {
			const { receiptId } = action;

			return {
				...state,
				[ receiptId ]: true,
			};
		}
		case BILLING_RECEIPT_EMAIL_SEND_FAILURE: {
			const { receiptId } = action;

			return {
				...state,
				[ receiptId ]: false,
			};
		}
		case BILLING_RECEIPT_EMAIL_SEND_SUCCESS: {
			const { receiptId } = action;

			return {
				...state,
				[ receiptId ]: false,
			};
		}
	}

	return state;
} );

const combinedReducer = combineReducers( {
	items,
	requesting,
	sendingReceiptEmail,
	//individual transactions contains transactions that are not part of the items tree.
	//TODO: if pagination is implemented, address potential data duplication between individualTransactions and items
	individualTransactions,
	ui,
} );

export default withStorageKey( 'billingTransactions', combinedReducer );
