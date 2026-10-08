import {
	findPlanExpiryNoticeDismissMetaKey,
	getPurchaseExpiryCutoff,
	isPlanExpiryNoticeDismissed,
} from '../dismissal';

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

test.each( [
	[ '2026-02-23T12:00:00+00:00', Date.UTC( 2026, 1, 23, 23, 59, 59 ) ],
	[ '2026-02-23T00:00:00+00:00', Date.UTC( 2026, 1, 23, 23, 59, 59 ) ],
	[ '2026-02-24T01:00:00+02:00', Date.UTC( 2026, 1, 23, 23, 59, 59 ) ],
	[ '2026-12-31T18:00:00+00:00', Date.UTC( 2026, 11, 31, 23, 59, 59 ) ],
] )( 'the cutoff for an expiry of %s is the last second of its UTC day', ( expiry, cutoff ) => {
	expect( getPurchaseExpiryCutoff( expiry ) ).toBe( cutoff );
} );
