import {
	type CreditsStatus,
	buildMockCreditsStatus,
	clampPercent,
	formatCreditsDetail,
	formatPercent,
	getCreditsLabel,
	getCreditsTone,
	isCreditsExhausted,
	isCreditsLow,
} from '../credits';

const mockLocale = { slug: 'en' as string | undefined };
jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => mockLocale.slug } ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: ( format: string, ...args: unknown[] ) => {
		let index = 0;
		return format
			.replace( /%(\d+\$)?[sd]/g, () => String( args[ index++ ] ) )
			.replace( /%%/g, '%' );
	},
} ) );

const free = ( percent: number ): CreditsStatus => ( {
	plan: 'free',
	percent,
	pools: [ { id: 'free', label: 'Free credits', percent } ],
} );

const paid = ( percent: number ): CreditsStatus => ( {
	plan: 'paid',
	percent,
	pools: [ { id: 'plan', label: 'Monthly plan', percent } ],
} );

describe( 'clampPercent', () => {
	it( 'clamps to 0–100 without rounding', () => {
		expect( clampPercent( 55.9 ) ).toBe( 55.9 );
		expect( clampPercent( 0.4 ) ).toBe( 0.4 );
		expect( clampPercent( 140 ) ).toBe( 100 );
		expect( clampPercent( -3 ) ).toBe( 0 );
		expect( clampPercent( Number.NaN ) ).toBe( 0 );
	} );
} );

describe( 'formatPercent', () => {
	it( 'floors for labels but keeps a spendable fraction distinct from zero', () => {
		expect( formatPercent( 55.9 ) ).toBe( '55' );
		expect( formatPercent( 0.4 ) ).toBe( '<1' );
		expect( formatPercent( 0 ) ).toBe( '0' );
		expect( formatPercent( 100 ) ).toBe( '100' );
	} );
} );

describe( 'credit states', () => {
	it( 'reads low only on free plans within the threshold', () => {
		expect( isCreditsLow( free( 20 ) ) ).toBe( true );
		expect( isCreditsLow( free( 21 ) ) ).toBe( false );
		expect( isCreditsLow( free( 0 ) ) ).toBe( false );
		expect( isCreditsLow( paid( 5 ) ) ).toBe( false );
	} );

	it( 'reads exhausted only at an exact zero, for any plan', () => {
		expect( isCreditsExhausted( free( 0 ) ) ).toBe( true );
		expect( isCreditsExhausted( paid( 0 ) ) ).toBe( true );
		expect( isCreditsExhausted( free( 0.4 ) ) ).toBe( false );
		expect( isCreditsExhausted( free( 1 ) ) ).toBe( false );
	} );
} );

describe( 'getCreditsTone', () => {
	it( 'is muted for paid plans regardless of balance', () => {
		expect( getCreditsTone( paid( 100 ) ) ).toBe( 'muted' );
		expect( getCreditsTone( paid( 0 ) ) ).toBe( 'muted' );
	} );

	it( 'turns to the error tone for low and exhausted free plans', () => {
		expect( getCreditsTone( free( 55 ) ) ).toBe( 'primary' );
		expect( getCreditsTone( free( 15 ) ) ).toBe( 'error' );
		expect( getCreditsTone( free( 0 ) ) ).toBe( 'error' );
	} );
} );

describe( 'getCreditsLabel', () => {
	it( 'names the pool by plan', () => {
		expect( getCreditsLabel( free( 55 ) ) ).toBe( '55% of free credits left' );
		expect( getCreditsLabel( paid( 72 ) ) ).toBe( '72% of site credits left' );
		expect( getCreditsLabel( free( 0.4 ) ) ).toBe( '<1% of free credits left' );
	} );
} );

describe( 'formatCreditsDetail', () => {
	it( 'omits the detail when the pool has no exact figures', () => {
		expect( formatCreditsDetail( { id: 'free', label: 'Free', percent: 10 } ) ).toBeUndefined();
	} );

	it( 'formats remaining of total', () => {
		expect(
			formatCreditsDetail( {
				id: 'plan',
				label: 'Monthly plan',
				percent: 72,
				remaining: 10800,
				total: 15000,
			} )
		).toBe( '10,800 of 15,000 credits' );
	} );

	it( 'formats the figures in the interface locale, not the browser one', () => {
		const pool = {
			id: 'plan' as const,
			label: 'Monthly plan',
			percent: 72,
			remaining: 10800,
			total: 15000,
		};
		mockLocale.slug = 'de';
		expect( formatCreditsDetail( pool ) ).toBe( '10.800 of 15.000 credits' );
		// A regional variant with different grouping from its base locale.
		mockLocale.slug = 'es';
		expect( formatCreditsDetail( pool ) ).toBe( '10.800 of 15.000 credits' );
		mockLocale.slug = 'es-mx';
		expect( formatCreditsDetail( pool ) ).toBe( '10,800 of 15,000 credits' );
		mockLocale.slug = 'not a locale';
		expect( formatCreditsDetail( pool ) ).toBe( '10,800 of 15,000 credits' );
		mockLocale.slug = 'en';
	} );
} );

describe( 'buildMockCreditsStatus', () => {
	const pools = ( percent: number ) =>
		Object.fromEntries(
			buildMockCreditsStatus( 'paid', percent ).pools.map( ( p ) => [ p.id, p ] )
		);

	it( 'gives free plans a single percent-only pool', () => {
		expect( buildMockCreditsStatus( 'free', 15 ) ).toEqual( {
			plan: 'free',
			percent: 15,
			pools: [ { id: 'free', label: 'Free credits', percent: 15 } ],
		} );
	} );

	it( 'drains the paid plan pool before top-ups, consistently with the aggregate', () => {
		expect( pools( 100 ).plan.remaining ).toBe( 15000 );
		expect( pools( 100 ).topups.remaining ).toBe( 1000 );
		expect( pools( 50 ).plan.remaining ).toBe( 7000 );
		expect( pools( 50 ).topups.remaining ).toBe( 1000 );
		expect( pools( 5 ).plan.remaining ).toBe( 0 );
		expect( pools( 5 ).topups.remaining ).toBe( 800 );
		expect( pools( 0 ).plan.percent ).toBe( 0 );
		expect( pools( 0 ).topups.percent ).toBe( 0 );
	} );
} );
