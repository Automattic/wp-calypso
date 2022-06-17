import { withStorageKey } from '@automattic/state-utils';
import {
	PURCHASE_CANCELLATION_OFFER_REQUEST,
	PURCHASE_CANCELLATION_OFFER_RECEIVE,
	PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

const isFetching = ( state = {}, action ) => {
	switch ( action.type ) {
		case PURCHASE_CANCELLATION_OFFER_REQUEST:
			return true;
		case PURCHASE_CANCELLATION_OFFER_RECEIVE:
		case PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE:
			return false;
	}

	return state;
};

const error = ( state = {}, action ) => {
	switch ( action.type ) {
		case PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE:
			return action.error;
	}

	return state;
};

const offers = ( state = [], action ) => {
	switch ( action.type ) {
		case PURCHASE_CANCELLATION_OFFER_RECEIVE:
			return action.offers;
	}

	return state;
};

const cancellationOffers = combineReducers( {
	isFetching,
	error,
	offers,
} );

const reducer = keyedReducer( 'purchaseId', cancellationOffers );
export default withStorageKey( 'cancellationOffers', reducer );
