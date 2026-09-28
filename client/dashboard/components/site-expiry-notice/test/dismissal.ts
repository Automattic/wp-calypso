import { findPlanExpiryNoticeDismissMetaKey, isPlanExpiryNoticeDismissed } from '../dismissal';

const REVERTED_AT = Date.UTC( 2026, 1, 10, 12 );

test( 'finds the per-site key by suffix, whatever the prefix', () => {
	expect(
		findPlanExpiryNoticeDismissMetaKey( {
			wp_123_wpcom_plan_expiry_notice_dismiss: 0,
			wp_123_wpcom_plan_expiry_modal_dismiss: 0,
		} )
	).toBe( 'wp_123_wpcom_plan_expiry_notice_dismiss' );
	expect( findPlanExpiryNoticeDismissMetaKey( { other: 1 } ) ).toBeUndefined();
	expect( findPlanExpiryNoticeDismissMetaKey( undefined ) ).toBeUndefined();
} );

test( 'a stamp at or after the reference counts; older or missing does not', () => {
	const seconds = Math.floor( REVERTED_AT / 1000 );
	expect( isPlanExpiryNoticeDismissed( undefined, REVERTED_AT ) ).toBe( false );
	expect( isPlanExpiryNoticeDismissed( 0, REVERTED_AT ) ).toBe( false );
	expect( isPlanExpiryNoticeDismissed( seconds - 1, REVERTED_AT ) ).toBe( false );
	expect( isPlanExpiryNoticeDismissed( seconds, REVERTED_AT ) ).toBe( true );
	expect( isPlanExpiryNoticeDismissed( seconds + 86400, REVERTED_AT ) ).toBe( true );
} );
