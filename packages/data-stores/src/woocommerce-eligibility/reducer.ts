import { combineReducers } from '@wordpress/data';
import {
	TRANSFER_ELIGIBILITY_RECEIVE,
	TRANSFER_ELIGIBILITY_REQUEST,
	TRANSFER_ELIGIBILITY_REQUEST_FAILURE,
	LATEST_TRANSFER_RECEIVE,
	LATEST_TRANSFER_RECEIVE_FAILURE,
} from './constants';
import { TransferEligibility, AtomicTransfer } from './types';
import type { Action } from './actions';
import type { Reducer } from 'redux';

export const transferEligibility = ( state: any, action: any ) => {
	switch ( action.type ) {
		case TRANSFER_ELIGIBILITY_RECEIVE:
			return {
				...state,
				[ action.siteId ]: action.transferEligibility,
			};
	}

	return state;
};

// Tracks product list fetching state
export const isFetchingTransferEligibility: Reducer< boolean | undefined, Action > = (
	state = false,
	action
) => {
	switch ( action.type ) {
		case TRANSFER_ELIGIBILITY_REQUEST:
			return true;
		case TRANSFER_ELIGIBILITY_RECEIVE:
			return false;
		case TRANSFER_ELIGIBILITY_REQUEST_FAILURE:
			return false;
	}

	return state;
};

export const latestAtomicTransfer = ( state: any, action: any ) => {
	switch ( action.type ) {
		case LATEST_TRANSFER_RECEIVE:
			return {
				...state,
				[ action.siteId ]: action.transfer,
			};
		case LATEST_TRANSFER_RECEIVE_FAILURE:
			return {
				...state,
				[ action.siteId ]: {
					error: action.error,
				},
			};
	}

	return state;
};

const reducer = combineReducers( {
	isFetchingTransferEligibility,
	transferEligibility,
	latestAtomicTransfer,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
