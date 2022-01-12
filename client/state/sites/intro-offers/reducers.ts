import { keyBy } from 'lodash';
import {
	SITE_INTRO_OFFER_RECEIVE,
	SITE_INTRO_OFFER_REQUEST,
	SITE_INTRO_OFFER_REQUEST_FAILURE,
	SITE_INTRO_OFFER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import { IntroOffer } from './types';
import type { Action } from 'redux';

export enum RequestStatus {
	Pending = 'pending',
	Success = 'success',
	Failed = 'failed',
}

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
	introOffers: IntroOffer[];
}

export const items = keyedReducer< string | undefined, IntroOfferReceiveAction >(
	'siteId',
	( state, { type, introOffers }: IntroOfferReceiveAction ) => {
		switch ( type ) {
			case SITE_INTRO_OFFER_RECEIVE:
				return keyBy( introOffers, 'productId' );
		}

		return state;
	}
);

export default combineReducers( {
	requestStatus,
	items,
} );
