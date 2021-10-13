import {
	MARKETING_CLICK_UPGRADE_NUDGE,
	MARKETING_JETPACK_SALE_COUPON_FETCH,
	MARKETING_JETPACK_SALE_COUPON_RECEIVE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/marketing';

export const clickUpgradeNudge = ( siteId, nudgeName ) => ( {
	type: MARKETING_CLICK_UPGRADE_NUDGE,
	siteId,
	nudgeName,
} );

export const fetchJetpackSaleCoupon = () => ( {
	type: MARKETING_JETPACK_SALE_COUPON_FETCH,
} );

export const receiveJetpackSaleCoupon = ( jetpackSaleCoupon ) => ( {
	type: MARKETING_JETPACK_SALE_COUPON_RECEIVE,
	jetpackSaleCoupon,
} );
