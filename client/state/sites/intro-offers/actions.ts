import { SITE_INTRO_OFFER_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/introductory-offers';
import 'calypso/state/jetpack-checkout/init';

interface GetIntroOffersActionType {
	type: typeof SITE_INTRO_OFFER_REQUEST;
	siteId: number | 'none';
	currency: string | undefined;
}

export function fetchIntroOffers(
	siteId: number | 'none' = 'none',
	currency: string | undefined
): GetIntroOffersActionType {
	return {
		type: SITE_INTRO_OFFER_REQUEST,
		siteId,
		currency,
	};
}
