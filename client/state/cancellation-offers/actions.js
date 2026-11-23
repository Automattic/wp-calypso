import {
	PURCHASE_CANCELLATION_OFFER_REQUEST,
	PURCHASE_CANCELLATION_OFFER_APPLY,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/cancellation-offers/index';
import 'calypso/state/cancellation-offers/init';

export const fetchCancellationOffers = ( siteId, purchaseId ) => ( {
	type: PURCHASE_CANCELLATION_OFFER_REQUEST,
	siteId,
	purchaseId,
} );

export const applyCancellationOffer = ( siteId, purchaseId ) => ( {
	type: PURCHASE_CANCELLATION_OFFER_APPLY,
	siteId,
	purchaseId,
} );
