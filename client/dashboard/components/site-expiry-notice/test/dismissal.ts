import { findPlanExpiryNoticeDismissMetaKey, isPlanExpiryNoticeDismissed } from '../dismissal';
import type { Purchase } from '@automattic/api-core';

const purchase = { expiry_date: '2026-01-15T12:00:00Z' } as Purchase;
const expirySeconds = Math.floor( new Date( purchase.expiry_date ).getTime() / 1000 );

test( 'finds the Atomic and Simple prefixed keys, and nothing else', () => {
	expect( findPlanExpiryNoticeDismissMetaKey( { wp_wpcom_plan_expiry_notice_dismiss: 0 } ) ).toBe(
		'wp_wpcom_plan_expiry_notice_dismiss'
	);
	expect(
		findPlanExpiryNoticeDismissMetaKey( { wp_123_wpcom_plan_expiry_notice_dismiss: 0, other: 1 } )
	).toBe( 'wp_123_wpcom_plan_expiry_notice_dismiss' );
	expect(
		findPlanExpiryNoticeDismissMetaKey( { wp_wpcom_plan_expiry_modal_dismiss: 0 } )
	).toBeUndefined();
	expect( findPlanExpiryNoticeDismissMetaKey( undefined ) ).toBeUndefined();
} );

test( 'a stamp counts only from the second this term expired', () => {
	expect( isPlanExpiryNoticeDismissed( undefined, purchase ) ).toBe( false );
	expect( isPlanExpiryNoticeDismissed( 0, purchase ) ).toBe( false );
	expect( isPlanExpiryNoticeDismissed( expirySeconds - 1, purchase ) ).toBe( false );
	expect( isPlanExpiryNoticeDismissed( expirySeconds, purchase ) ).toBe( true );
	expect( isPlanExpiryNoticeDismissed( expirySeconds + 1, purchase ) ).toBe( true );
} );
