import {
	type CreditsStatus,
	clampPercent,
	formatCreditsDetail,
	getCreditsLabel,
	getCreditsTone,
	isCreditsExhausted,
	isCreditsLow,
} from '../credits';

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
	it( 'floors and clamps to 0–100', () => {
		expect( clampPercent( 55.9 ) ).toBe( 55 );
		expect( clampPercent( 140 ) ).toBe( 100 );
		expect( clampPercent( -3 ) ).toBe( 0 );
		expect( clampPercent( Number.NaN ) ).toBe( 0 );
	} );
} );

describe( 'credit states', () => {
	it( 'reads low only on free plans within the threshold', () => {
		expect( isCreditsLow( free( 20 ) ) ).toBe( true );
		expect( isCreditsLow( free( 21 ) ) ).toBe( false );
		expect( isCreditsLow( free( 0 ) ) ).toBe( false );
		expect( isCreditsLow( paid( 5 ) ) ).toBe( false );
	} );

	it( 'reads exhausted at zero for any plan', () => {
		expect( isCreditsExhausted( free( 0 ) ) ).toBe( true );
		expect( isCreditsExhausted( free( 0.4 ) ) ).toBe( true );
		expect( isCreditsExhausted( paid( 0 ) ) ).toBe( true );
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
		expect( getCreditsLabel( paid( 72 ) ) ).toBe( '72% of monthly credits left' );
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
} );
