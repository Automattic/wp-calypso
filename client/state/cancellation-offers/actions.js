import {
	PURCHASE_CANCELLATION_OFFER_REQUEST,
	PURCHASE_CANCELLATION_OFFER_RECEIVE,
	PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/cancellation-offers/index';
import 'calypso/state/cancellation-offers/init';

export const fetchCancellationOffers = ( siteId, purchaseId, ownershipId ) => ( {
	type: PURCHASE_CANCELLATION_OFFER_REQUEST,
	siteId,
	purchaseId,
	ownershipId,
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
