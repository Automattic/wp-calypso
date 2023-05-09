import {
	PURCHASE_CANCELLATION_OFFER_REQUEST,
	PURCHASE_CANCELLATION_OFFER_RECEIVE,
	PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE,
	PURCHASE_CANCELLATION_OFFER_APPLY,
	PURCHASE_CANCELLATION_OFFER_APPLY_SUCCESS,
	PURCHASE_CANCELLATION_OFFER_APPLY_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/cancellation-offers/index';
import 'calypso/state/cancellation-offers/init';

export const fetchCancellationOffers = ( siteId, purchaseId ) => ( {
	type: PURCHASE_CANCELLATION_OFFER_REQUEST,
	siteId,
	purchaseId,
} );

export const receiveCancellationOffers = ( purchaseId, offers ) => ( {
	type: PURCHASE_CANCELLATION_OFFER_RECEIVE,
	purchaseId,
	offers,
} );

export const receiveCancellationOffersError = ( purchaseId, error ) => ( {
	type: PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE,
	purchaseId,
	error,
} );

export const applyCancellationOffer = ( siteId, purchaseId ) => ( {
	type: PURCHASE_CANCELLATION_OFFER_APPLY,
	siteId,
	purchaseId,
} );

export const applyCancellationOfferSuccess = ( purchaseId, success ) => ( {
	type: PURCHASE_CANCELLATION_OFFER_APPLY_SUCCESS,
	purchaseId,
	success,
} );

export const applyCancellationOfferError = ( purchaseId, error ) => ( {
	type: PURCHASE_CANCELLATION_OFFER_APPLY_FAILURE,
	purchaseId,
	error,
} );
