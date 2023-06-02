import {
	SITE_INTRO_OFFER_RECEIVE,
	SITE_INTRO_OFFER_REQUEST,
	SITE_INTRO_OFFER_REQUEST_FAILURE,
	SITE_INTRO_OFFER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import { IntroOffer, ResponseIntroOffer, RequestStatus } from './types';
import type { Action } from 'redux';

export interface IntroOfferReceiveAction extends Action {
	payload?: ResponseIntroOffer[];
}

interface IntroOfferItemsState {
	[ productId: number ]: IntroOffer;
}

const mapResponseObject = ( {
	currency_code,
	discount_percentage,
	formatted_price,
	ineligible_reason,
	product_id,
	product_slug,
	raw_price,
}: ResponseIntroOffer ): IntroOffer => ( {
	currencyCode: currency_code,
	discountPercentage: discount_percentage,
	formattedPrice: formatted_price,
	ineligibleReason: ineligible_reason,
	productId: product_id,
	productSlug: product_slug,
	rawPrice: raw_price,
} );

const createIntroOfferMap = ( payload: ResponseIntroOffer[] ) => {
	const map: {
		[ productId: number ]: IntroOffer;
	} = {};

	payload.forEach( ( payloadIntroOffer ) => {
		map[ payloadIntroOffer.product_id ] = mapResponseObject( payloadIntroOffer );
	} );

	return map;
};

export const requestStatus = keyedReducer( 'siteId', ( state, { type } ) => {
	switch ( type ) {
		case SITE_INTRO_OFFER_REQUEST:
			return RequestStatus.Pending;

		case SITE_INTRO_OFFER_REQUEST_SUCCESS:
			return RequestStatus.Success;

		case SITE_INTRO_OFFER_REQUEST_FAILURE:
			return RequestStatus.Failed;
	}

	return state;
} );

export const items = keyedReducer< IntroOfferItemsState | undefined, IntroOfferReceiveAction >(
	'siteId',
	( state, { type, payload }: IntroOfferReceiveAction ) => {
		switch ( type ) {
			case SITE_INTRO_OFFER_RECEIVE:
				return payload ? createIntroOfferMap( payload ) : undefined;
		}

		return state;
	}
);

export default combineReducers( {
	requestStatus,
	items,
} );
