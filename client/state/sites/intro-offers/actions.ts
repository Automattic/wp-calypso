import { SITE_INTRO_OFFER_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/intro-offers';
import 'calypso/state/jetpack-checkout/init';

interface GetIntroOffersActionType {
	type: typeof SITE_INTRO_OFFER_REQUEST;
	siteId: number;
}

export function fetchIntroOffers( siteId: number ): GetIntroOffersActionType {
	return {
		type: SITE_INTRO_OFFER_REQUEST,
		siteId,
	};
}
