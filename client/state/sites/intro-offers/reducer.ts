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
	product_id,
	product_slug,
	currency_code,
	formatted_price,
	raw_price,
	ineligible_reason,
}: ResponseIntroOffer ): IntroOffer => ( {
	productId: product_id,
	productSlug: product_slug,
	currencyCode: currency_code,
	formattedPrice: formatted_price,
	rawPrice: raw_price,
	ineligibleReason: ineligible_reason,
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
