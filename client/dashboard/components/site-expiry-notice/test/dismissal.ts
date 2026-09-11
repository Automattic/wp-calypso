import { DotcomPlans } from '@automattic/api-core';
import { findPlanExpiryNoticeDismissMetaKey, isPlanExpiryNoticeDismissed } from '../dismissal';
import type { Purchase } from '@automattic/api-core';

const purchase = {
	product_slug: DotcomPlans.BUSINESS,
	expiry_date: '2026-01-15T12:00:00Z',
} as Purchase;
const expirySeconds = Math.floor( new Date( purchase.expiry_date ).getTime() / 1000 );

describe( 'findPlanExpiryNoticeDismissMetaKey', () => {
	test( 'finds the Atomic and Simple prefixed keys', () => {
		expect( findPlanExpiryNoticeDismissMetaKey( { wp_wpcom_plan_expiry_notice_dismiss: 0 } ) ).toBe(
			'wp_wpcom_plan_expiry_notice_dismiss'
		);
		expect(
			findPlanExpiryNoticeDismissMetaKey( {
				wp_123_wpcom_plan_expiry_notice_dismiss: 0,
				other: 1,
			} )
		).toBe( 'wp_123_wpcom_plan_expiry_notice_dismiss' );
	} );

	test( 'ignores the modal keys and missing meta', () => {
		expect(
			findPlanExpiryNoticeDismissMetaKey( { wp_wpcom_plan_expiry_modal_dismiss: 0 } )
		).toBeUndefined();
		expect( findPlanExpiryNoticeDismissMetaKey( undefined ) ).toBeUndefined();
	} );
} );

describe( 'isPlanExpiryNoticeDismissed', () => {
	test( 'false without a stamp or with a zero stamp', () => {
		expect( isPlanExpiryNoticeDismissed( undefined, purchase ) ).toBe( false );
		expect( isPlanExpiryNoticeDismissed( 0, purchase ) ).toBe( false );
	} );
	test( 'false for a stamp from before this term expired', () => {
		expect( isPlanExpiryNoticeDismissed( expirySeconds - 1, purchase ) ).toBe( false );
	} );
	test( 'true for a stamp on or after the expiry second', () => {
		expect( isPlanExpiryNoticeDismissed( expirySeconds, purchase ) ).toBe( true );
		expect( isPlanExpiryNoticeDismissed( expirySeconds + 1, purchase ) ).toBe( true );
	} );
} );
