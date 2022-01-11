import {
	SITE_INTRO_OFFER_RECEIVE,
	SITE_INTRO_OFFER_REQUEST,
	SITE_INTRO_OFFER_REQUEST_FAILURE,
	SITE_INTRO_OFFER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import type { Action } from 'redux';

export enum RequestStatus {
	Pending,
	Success,
	Failed,
}

export const requestStatus = ( state = {}, { type }: Action ) => {
	switch ( type ) {
		case SITE_INTRO_OFFER_REQUEST:
			return RequestStatus.Pending;

		case SITE_INTRO_OFFER_REQUEST_SUCCESS:
			return RequestStatus.Success;

		case SITE_INTRO_OFFER_REQUEST_FAILURE:
			return RequestStatus.Failed;
	}

	return state;
};

interface PayloadIntroOffer {
	currency_code: string;
	formatted_price: string;
	raw_price: number;
}

// interface IntroOffer {
// 	currencyCode: string;
// 	formattedPrice: string;
// 	rawPrice: number;
// }

// const mapPayloadToIntroOffer = ( payload: PayloadIntroOffer ): IntroOffer => ( {
// 	currencyCode: payload.currency_code,
// 	formattedPrice: payload.formatted_price,
// 	rawPrice: payload.raw_price,
// } );

interface IntroOffersReceiveAction extends Action {
	siteId: number;
	payload: {
		[ productId: number ]: PayloadIntroOffer;
	};
}

// interface IntroOffersState {
// 	[ productId: number ]: PayloadIntroOffer;
// }

export const items = ( state = {}, { type, payload, siteId }: IntroOffersReceiveAction ) => {
	switch ( type ) {
		case SITE_INTRO_OFFER_RECEIVE:
			return Object.assign( {}, state, {
				[ siteId ]: payload,
			} );
	}

	return state;
};

export default combineReducers( {
	requestStatus,
	items,
} );
