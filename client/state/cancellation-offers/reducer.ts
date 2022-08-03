import { withStorageKey } from '@automattic/state-utils';
import {
	PURCHASE_CANCELLATION_OFFER_REQUEST,
	PURCHASE_CANCELLATION_OFFER_RECEIVE,
	PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import {
	CancellationOffer,
	CancellationOfferAPIResponse,
} from 'calypso/state/cancellation-offers/types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import type { AnyAction } from 'redux';

// Map the response to a typed object.
const mapResponseObject = ( {
	currency_code,
	discount_percentage,
	discounted_periods,
	formatted_price,
	original_price,
	raw_price,
}: CancellationOfferAPIResponse ): CancellationOffer => ( {
	currencyCode: currency_code,
	discountPercentage: discount_percentage,
	discountedPeriods: discounted_periods,
	formattedPrice: formatted_price,
	originalPrice: original_price,
	rawPrice: raw_price,
} );

const createCancellationOfferMap = ( payload: CancellationOfferAPIResponse[] ) => {
	return payload.map( mapResponseObject );
};

const isFetching = ( state = null, action: AnyAction ) => {
	switch ( action.type ) {
		case PURCHASE_CANCELLATION_OFFER_REQUEST:
			return true;
		case PURCHASE_CANCELLATION_OFFER_RECEIVE:
		case PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE:
			return false;
	}

	return state;
};

const error = ( state = {}, action: AnyAction ) => {
	switch ( action.type ) {
		case PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE:
			return action.error;
	}

	return state;
};

export const offers = ( state = [], action: AnyAction ) => {
	switch ( action.type ) {
		case PURCHASE_CANCELLATION_OFFER_RECEIVE:
			return createCancellationOfferMap( action.offers );
	}

	return state;
};

const cancellationOffersReducer = combineReducers( {
	isFetching,
	error,
	offers,
} );

const reducer = keyedReducer( 'purchaseId', cancellationOffersReducer );
export default withStorageKey( 'cancellationOffers', reducer );
