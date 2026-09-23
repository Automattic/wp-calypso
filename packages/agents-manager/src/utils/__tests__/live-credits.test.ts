import { buildLiveCreditsStatus, parseCreditSnapshot } from '../live-credits';
import { creditSnapshot } from './fixtures/credit-snapshot';

jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: ( format: string, value: unknown ) => format.replace( '%s', String( value ) ),
} ) );

it( 'adapts the real draft allowance to one exact paid pool with its server reset date', () => {
	const snapshot = creditSnapshot();
	expect( parseCreditSnapshot( snapshot, 123 ) ).toEqual( snapshot );
	expect( buildLiveCreditsStatus( snapshot ) ).toEqual( {
		plan: 'paid',
		percent: 98,
		remaining: 2450,
		pools: [
			{
				id: 'plan',
				label: 'Monthly plan',
				percent: 98,
				remaining: 2450,
				total: 2500,
				dateLabel: 'Resets Oct 1 (UTC)',
			},
		],
	} );
} );
it.each( [ 'personal', 'premium', 'business', 'commerce' ] as const )(
	'preserves the server tier %s independently of the allowance amount',
	( plan_tier ) => {
		const snapshot = creditSnapshot( { plan_tier } );
		const parsed = parseCreditSnapshot( snapshot, 123 );
		expect( parsed ).toEqual( snapshot );
		expect( buildLiveCreditsStatus( parsed! ) ).toMatchObject( {
			plan: 'paid',
			planTier: plan_tier,
			remaining: 2450,
		} );
	}
);
it( 'retains legacy balances without inferring a tier from the allowance', () => {
	const parsed = parseCreditSnapshot( creditSnapshot(), 123 );
	const status = buildLiveCreditsStatus( parsed! );
	expect( parsed ).not.toHaveProperty( 'plan_tier' );
	expect( status ).not.toHaveProperty( 'planTier' );
	expect( status ).toMatchObject( { plan: 'paid', remaining: 2450 } );
} );
it.each( [
	undefined,
	null,
	'',
	'free',
	'enterprise',
	'Personal',
	2500,
	false,
	{},
	[ 'personal' ],
] )(
	'ignores unknown tier %p without discarding or mutating the numeric snapshot',
	( plan_tier ) => {
		const snapshot = Object.freeze( { ...creditSnapshot(), plan_tier } );
		const parsed = parseCreditSnapshot( snapshot, 123 );
		expect( parsed ).toEqual( creditSnapshot() );
		expect( parsed ).not.toHaveProperty( 'plan_tier' );
		const status = buildLiveCreditsStatus( parsed! );
		expect( status ).not.toHaveProperty( 'planTier' );
		expect( status ).toMatchObject( { plan: 'paid', remaining: 2450 } );
		expect( snapshot.plan_tier ).toBe( plan_tier );
	}
);
it.each( [ false, true ] )(
	'accepts exhausted completion and blocked rejection (blocked=%s)',
	( blocked ) => {
		const snapshot = creditSnapshot( {
			credits_used: 2501,
			credits_remaining: 0,
			exhausted: true,
			blocked,
		} );
		expect( parseCreditSnapshot( snapshot, 123 ) ).toEqual( snapshot );
		expect( buildLiveCreditsStatus( snapshot ).remaining ).toBe( 0 );
	}
);
it( 'preserves the exact positive balance instead of treating display rounding as exhaustion', () => {
	const snapshot = creditSnapshot( { credits_used: 2499, credits_remaining: 1 } );
	expect( parseCreditSnapshot( snapshot, 123 ) ).toEqual( snapshot );
	expect( buildLiveCreditsStatus( snapshot ) ).toMatchObject( { percent: 0.04, remaining: 1 } );
} );
it.each( [ null, false, undefined ] )(
	'treats missing/unreadable backend status as unknown: %p',
	( snapshot ) => {
		expect( parseCreditSnapshot( snapshot, 123 ) ).toBeUndefined();
	}
);
it.each( [
	{ schema_version: 2 },
	{ policy_id: 'other' },
	{ cost_version: 'other' },
	{ accounting_mode: 'other' },
	{ reason: 'other' },
	{ eligible: false },
	{ preview: false },
	{ enforcement: 'none' },
	{ blog_id: 456 },
	{ credits_limit: 0 },
	{ credits_limit: Number.MAX_SAFE_INTEGER + 1 },
	{ credits_used: '50' },
	{ credits_remaining: NaN },
	{ credits_remaining: Infinity },
	{ credits_remaining: -1 },
	{ credits_used: 49.5, credits_remaining: 2450.5 },
	{ credits_remaining: 2400 },
	{ exhausted: true },
	{ blocked: true },
	{ blocked: 'false' },
	{ resets_at: '2026-02-30T00:00:00Z' },
	{ resets_at: null },
] )( 'rejects wrong-site, unsupported or inconsistent snapshots %p', ( overrides ) => {
	expect( parseCreditSnapshot( { ...creditSnapshot(), ...overrides }, 123 ) ).toBeUndefined();
} );

it.each( [ '2026-10-01T00:00:00Z', '2026-10-01T00:00:00+00:00', '2028-02-29T23:59:59+00:00' ] )(
	'accepts the UTC reset timestamp %s',
	( resets_at ) => {
		const snapshot = creditSnapshot( { resets_at } );
		expect( parseCreditSnapshot( snapshot, 123 ) ).toEqual( snapshot );
	}
);
it.each( [
	'2026-02-30T00:00:00+00:00',
	'2026-02-29T00:00:00Z',
	'2026-10-01T24:00:00+00:00',
	'2026-10-01T00:00:00+01:00',
	'2026-10-01T00:00:00-01:00',
	'2026-10-01T00:00:00',
	'2026-10-01T00:00:00.123Z',
] )( 'rejects invalid or unsupported UTC reset timestamp %s', ( resets_at ) => {
	expect( parseCreditSnapshot( creditSnapshot( { resets_at } ), 123 ) ).toBeUndefined();
} );
