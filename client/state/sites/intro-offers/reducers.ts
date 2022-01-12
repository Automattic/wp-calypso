import { Dictionary, keyBy } from 'lodash';
import {
	SITE_INTRO_OFFER_RECEIVE,
	SITE_INTRO_OFFER_REQUEST,
	SITE_INTRO_OFFER_REQUEST_FAILURE,
	SITE_INTRO_OFFER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import { IntroOffer, ResponseIntroOffer, RequestStatus } from './types';
import type { Action } from 'redux';

const mapResponse = ( {
	product_id,
	product_slug,
	currency_code,
	formatted_price,
	raw_price,
}: ResponseIntroOffer ): IntroOffer => ( {
	productId: product_id,
	productSlug: product_slug,
	currencyCode: currency_code,
	formattedPrice: formatted_price,
	rawPrice: raw_price,
} );
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

interface IntroOfferReceiveAction extends Action {
	payload?: ResponseIntroOffer[];
}

export const items = keyedReducer< Dictionary< IntroOffer > | undefined, IntroOfferReceiveAction >(
	'siteId',
	( state, { type, payload }: IntroOfferReceiveAction ) => {
		switch ( type ) {
			case SITE_INTRO_OFFER_RECEIVE:
				return payload ? keyBy( payload.map( mapResponse ), 'productId' ) : undefined;
		}

		return state;
	}
);

export default combineReducers( {
	requestStatus,
	items,
} );
