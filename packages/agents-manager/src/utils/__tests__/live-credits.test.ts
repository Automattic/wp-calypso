import { getCreditsLabel, isCreditsExhausted } from '../credits';
import {
	buildLiveCreditsStatus,
	getCreditsUpgradeUrl,
	parseCreditSnapshot,
	parseLiveCreditsStatus,
} from '../live-credits';
import { creditSnapshot } from './fixtures/credit-snapshot';
import { localNumber } from './fixtures/local-number';

jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_n: ( single: string, plural: string, count: number ) => ( count === 1 ? single : plural ),
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
it( 'gives other chats the dot status for a valid snapshot and nothing for an unknown one', () => {
	const snapshot = creditSnapshot();
	expect( parseLiveCreditsStatus( snapshot, 123 ) ).toEqual( buildLiveCreditsStatus( snapshot ) );
	expect( parseLiveCreditsStatus( snapshot, 456 ) ).toBeUndefined();
} );
it.each( [
	{
		name: 'links a Personal plan by site ID',
		planTier: 'personal',
		site: 123,
		url: 'https://wordpress.com/plans/123',
	},
	{
		name: 'links a Business plan by domain',
		planTier: 'business',
		site: 'example.wordpress.com',
		url: 'https://wordpress.com/plans/example.wordpress.com',
	},
	{ name: 'gives the top plan no link', planTier: 'commerce', site: 123, url: undefined },
	{ name: 'gives an unknown plan no link', planTier: undefined, site: 123, url: undefined },
] as const )( 'upgrade: $name', ( { planTier, site, url } ) => {
	const status = { ...buildLiveCreditsStatus( creditSnapshot() ), planTier };
	expect( getCreditsUpgradeUrl( status, site ) ).toBe( url );
} );
it.each( [
	[ 'wpcom-site-monthly-v1', '2026-10-01T00:00:00Z', 'Oct 1' ],
	[ 'wpcom-site-plan-period-v1', '2026-10-17T14:30:00+00:00', 'Oct 17' ],
] as const )( 'accepts %s and displays its server reset date', ( policy_id, resets_at, date ) => {
	const snapshot = {
		...creditSnapshot(),
		policy_id,
		resets_at,
		period_start: '2026-09-17T14:30:00+00:00',
	};
	const parsed = parseCreditSnapshot( snapshot, 123 );
	expect( parsed ).toEqual( snapshot );
	expect( buildLiveCreditsStatus( parsed! ) ).toMatchObject( {
		plan: 'paid',
		remaining: 2450,
		pools: [ { dateLabel: `Resets ${ date } (UTC)` } ],
	} );
} );
it.each( [ 'wpcom-site-plan-period-v2', 'wpcom-site-monthly-v2', '', null ] )(
	'rejects unsupported policy %p',
	( policy_id ) => {
		expect( parseCreditSnapshot( { ...creditSnapshot(), policy_id }, 123 ) ).toBeUndefined();
	}
);
it.each( [
	{ blog_id: 456 },
	{ credits_remaining: 2400 },
	{ resets_at: '2026-10-17T14:30:00+01:00' },
	{ reason: 'wpcom_no_plan', eligible: false, credits_limit: 0 },
] )( 'retains paid snapshot validation for plan-period metadata %p', ( overrides ) => {
	expect(
		parseCreditSnapshot(
			{ ...creditSnapshot(), policy_id: 'wpcom-site-plan-period-v1', ...overrides },
			123
		)
	).toBeUndefined();
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
describe( 'combined balance', () => {
	// No plan credits left, but top-ups: the server counts the site as not exhausted.
	const topUpsOnly = creditSnapshot( {
		credits_used: 2500,
		credits_remaining: 0,
		credits_available: 67000,
	} );

	it( 'keeps the plan balance when an older snapshot has no combined balance', () => {
		const parsed = parseCreditSnapshot( creditSnapshot(), 123 );
		expect( parsed ).not.toHaveProperty( 'credits_available' );
		expect( buildLiveCreditsStatus( parsed! ) ).toMatchObject( { percent: 98, remaining: 2450 } );
		expect(
			parseCreditSnapshot(
				creditSnapshot( { credits_used: 2500, credits_remaining: 0, exhausted: true } ),
				123
			)
		).toBeDefined();
	} );

	it( 'accepts a combined balance equal to the plan balance', () => {
		const snapshot = creditSnapshot( { credits_available: 2450 } );
		expect( parseCreditSnapshot( snapshot, 123 ) ).toEqual( snapshot );
		expect( buildLiveCreditsStatus( snapshot ) ).toMatchObject( { percent: 98, remaining: 2450 } );
	} );

	it( 'reads top-ups as spendable once the plan credits run out', () => {
		expect( parseCreditSnapshot( topUpsOnly, 123 ) ).toEqual( topUpsOnly );
		const status = buildLiveCreditsStatus( topUpsOnly );
		expect( status ).toMatchObject( {
			percent: 0,
			remaining: 67000,
			pools: [ { id: 'plan', percent: 0, remaining: 0, total: 2500 } ],
		} );
		expect( isCreditsExhausted( status ) ).toBe( false );
		expect( getCreditsLabel( status ) ).toBe( `${ localNumber( 67 ) }k credits left` );
	} );

	it( 'reads an exhausted combined balance', () => {
		const snapshot = creditSnapshot( {
			credits_used: 2500,
			credits_remaining: 0,
			credits_available: 0,
			exhausted: true,
		} );
		expect( parseCreditSnapshot( snapshot, 123 ) ).toEqual( snapshot );
		expect( isCreditsExhausted( buildLiveCreditsStatus( snapshot ) ) ).toBe( true );
	} );

	it.each( [
		{ credits_available: -1 },
		{ credits_available: 2450.5 },
		{ credits_available: '67000' },
		{ credits_available: null },
		{ credits_available: Number.MAX_SAFE_INTEGER + 1 },
		{ credits_available: 2449 },
		{ ...topUpsOnly, exhausted: true },
		{ ...topUpsOnly, credits_available: 0 },
		{ ...topUpsOnly, blocked: true },
	] )( 'rejects an unreadable or inconsistent combined balance %p', ( overrides ) => {
		expect( parseCreditSnapshot( { ...creditSnapshot(), ...overrides }, 123 ) ).toBeUndefined();
	} );
} );
describe( 'top-ups', () => {
	// 10,800 of 15,000 plan credits left, and 67,000 of 100,000 top-up credits.
	const plan = {
		credits_limit: 15000,
		credits_used: 4200,
		credits_remaining: 10800,
		credits_available: 10800,
	};
	const withTopUps = creditSnapshot( {
		...plan,
		credits_available: 77800,
		top_up_credits_purchased: 100000,
		top_up_credits_used: 33000,
		top_up_credits_remaining: 67000,
	} );
	const planPool = {
		id: 'plan',
		label: 'Monthly plan',
		percent: 72,
		remaining: 10800,
		total: 15000,
		dateLabel: 'Resets Oct 1 (UTC)',
	};
	const withoutTopUps = ( snapshot: object ) =>
		Object.fromEntries(
			Object.entries( snapshot ).filter( ( [ key ] ) => ! key.startsWith( 'top_up_' ) )
		);

	it( 'adds a balance-only top-ups pool after the plan pool', () => {
		const parsed = parseCreditSnapshot( withTopUps, 123 );
		expect( parsed ).toEqual( withTopUps );
		const status = buildLiveCreditsStatus( parsed! );
		expect( status ).toEqual( {
			plan: 'paid',
			percent: 72,
			remaining: 77800,
			pools: [ planPool, { id: 'topups', label: 'Top-ups', remaining: 67000 } ],
		} );
		expect( getCreditsLabel( status ) ).toBe( `${ localNumber( 77.8 ) }k credits left` );
	} );

	it.each( [
		[ 'used up', {} ],
		[ 'used beyond purchases', { top_up_credits_used: 100500 } ],
		[
			'used up with the plan credits',
			{ credits_used: 15000, credits_remaining: 0, credits_available: 0, exhausted: true },
		],
	] as const )( 'shows bought top-ups %s as zero', ( _, overrides ) => {
		const snapshot = creditSnapshot( {
			...plan,
			top_up_credits_purchased: 100000,
			top_up_credits_used: 100000,
			top_up_credits_remaining: 0,
			...overrides,
		} );
		const parsed = parseCreditSnapshot( snapshot, 123 );
		expect( parsed ).toEqual( snapshot );
		expect( buildLiveCreditsStatus( parsed! ).pools[ 1 ] ).toEqual( {
			id: 'topups',
			label: 'Top-ups',
			remaining: 0,
		} );
	} );

	it.each( [
		[ 'a site not enrolled in top-ups', {} ],
		[
			'unreadable purchases',
			{
				top_up_credits_purchased: null,
				top_up_credits_used: 33000,
				top_up_credits_remaining: null,
			},
		],
		[
			'a site that never bought top-ups',
			{ top_up_credits_purchased: 0, top_up_credits_used: 0, top_up_credits_remaining: 0 },
		],
		[
			'purchases with an unknown balance',
			{
				top_up_credits_purchased: 100000,
				top_up_credits_used: 33000,
				top_up_credits_remaining: null,
			},
		],
		[
			'a balance with unknown purchases',
			{
				credits_available: 77800,
				top_up_credits_purchased: null,
				top_up_credits_used: 33000,
				top_up_credits_remaining: 67000,
			},
		],
	] as const )( 'has no top-ups pool for %s', ( _, topUps ) => {
		const snapshot = creditSnapshot( { ...plan, ...topUps } );
		const parsed = parseCreditSnapshot( snapshot, 123 );
		expect( parsed ).toEqual( snapshot );
		expect( buildLiveCreditsStatus( parsed! ) ).toMatchObject( {
			remaining: snapshot.credits_available,
			pools: [ planPool ],
		} );
	} );

	it.each( [
		{ top_up_credits_used: -1 },
		{ top_up_credits_used: '33000' },
		{ top_up_credits_used: null },
		{ top_up_credits_used: undefined },
		{ top_up_credits_purchased: 100000.5 },
		{ top_up_credits_purchased: Number.MAX_SAFE_INTEGER + 1 },
		{ top_up_credits_purchased: '100000' },
		{ top_up_credits_purchased: undefined },
		{ top_up_credits_remaining: -1 },
		{ top_up_credits_remaining: '67000' },
		{ top_up_credits_remaining: undefined },
		{ top_up_credits_remaining: 66999 },
		{ credits_available: 77799 },
		{ credits_available: 10800 },
		{ credits_available: undefined },
	] )( 'drops malformed or inconsistent top-ups and keeps the plan balance %p', ( overrides ) => {
		const snapshot = { ...withTopUps, ...overrides };
		const parsed = parseCreditSnapshot( snapshot, 123 );
		expect( parsed ).toEqual( withoutTopUps( snapshot ) );
		expect( buildLiveCreditsStatus( parsed! ) ).toMatchObject( {
			remaining: snapshot.credits_available ?? 10800,
			pools: [ planPool ],
		} );
	} );
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
