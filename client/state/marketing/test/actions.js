import {
	MARKETING_CLICK_UPGRADE_NUDGE,
	MARKETING_JETPACK_SALE_COUPON_FETCH,
} from 'calypso/state/action-types';
import { clickUpgradeNudge, fetchJetpackSaleCoupon } from '../actions';

describe( 'clickUpgradeNudge()', () => {
	test( 'should return the expected action object', () => {
		const nudgeName = 'profit!';
		const siteId = 123;

		expect( clickUpgradeNudge( siteId, nudgeName ) ).toEqual( {
			type: MARKETING_CLICK_UPGRADE_NUDGE,
			siteId,
			nudgeName,
		} );
	} );
} );

describe( 'fetchJetpackSaleCoupon()', () => {
	test( 'should return the expected action object', () => {
		expect( fetchJetpackSaleCoupon() ).toEqual( {
			type: MARKETING_JETPACK_SALE_COUPON_FETCH,
		} );
	} );
} );
