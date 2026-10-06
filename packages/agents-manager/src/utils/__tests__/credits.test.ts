import {
	type CreditsStatus,
	buildMockCreditsStatus,
	clampPercent,
	formatCreditsDetail,
	formatCreditsShort,
	formatPercent,
	getCreditsLabel,
	getCreditsTone,
	isCreditsExhausted,
	isCreditsLow,
} from '../credits';
import { localNumber } from './fixtures/local-number';

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

// A 15,000-credit plan; `remaining` adds any top-ups.
const paid = ( percent: number, remaining = Math.round( 150 * percent ) ): CreditsStatus => ( {
	plan: 'paid',
	percent,
	remaining,
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
		expect( isCreditsExhausted( { ...paid( 0 ), remaining: 1 } ) ).toBe( false );
		expect( isCreditsExhausted( free( 0.4 ) ) ).toBe( false );
		expect( isCreditsExhausted( free( 1 ) ) ).toBe( false );
	} );
} );

describe( 'getCreditsTone', () => {
	it.each( [
		[ 100, 'muted', 'primary' ],
		[ 20.01, 'muted', 'primary' ],
		[ 20, 'error', 'error' ],
		[ 19.99, 'error', 'error' ],
		[ 0.4, 'error', 'error' ],
		[ 0, 'error', 'error' ],
	] as const )(
		'uses the unrounded balance at %s%% for both plans',
		( percent, paidTone, freeTone ) => {
			expect( getCreditsTone( paid( percent ) ) ).toBe( paidTone );
			expect( getCreditsTone( free( percent ) ) ).toBe( freeTone );
		}
	);

	it( 'respects a custom threshold for both plans', () => {
		expect( getCreditsTone( paid( 10 ), 10 ) ).toBe( 'error' );
		expect( getCreditsTone( paid( 10.01 ), 10 ) ).toBe( 'muted' );
		expect( getCreditsTone( free( 10 ), 10 ) ).toBe( 'error' );
		expect( getCreditsTone( free( 10.01 ), 10 ) ).toBe( 'primary' );
	} );
} );

describe( 'formatCreditsShort', () => {
	it.each( [
		[ 0, localNumber( 0 ) ],
		[ 800, localNumber( 800 ) ],
		[ 999, localNumber( 999 ) ],
		[ 1000, `${ localNumber( 1 ) }k` ],
		[ 1050, `${ localNumber( 1 ) }k` ],
		[ 8500, `${ localNumber( 8.5 ) }k` ],
		[ 10850, `${ localNumber( 10.8 ) }k` ],
		[ 19999, `${ localNumber( 19.9 ) }k` ],
		[ 20000, `${ localNumber( 20 ) }k` ],
		[ 67000, `${ localNumber( 67 ) }k` ],
		[ 100000, `${ localNumber( 100 ) }k` ],
	] )( 'reads %i credits as "%s", rounding down', ( credits, short ) => {
		expect( formatCreditsShort( credits ) ).toBe( short );
	} );
} );

describe( 'getCreditsLabel', () => {
	it( 'gives free plans a percentage', () => {
		expect( getCreditsLabel( free( 55 ) ) ).toBe( '55% of free credits left' );
		expect( getCreditsLabel( free( 0.4 ) ) ).toBe( '<1% of free credits left' );
	} );

	it( 'gives paid plans the combined balance as an amount, not the plan percentage', () => {
		expect( getCreditsLabel( paid( 72 ) ) ).toBe( `${ localNumber( 10.8 ) }k credits left` );
		expect( getCreditsLabel( paid( 0.4, 800 ) ) ).toBe( `${ localNumber( 800 ) } credits left` );
		expect( getCreditsLabel( paid( 0, 67000 ) ) ).toBe( `${ localNumber( 67 ) }k credits left` );
	} );
} );

describe( 'formatCreditsDetail', () => {
	it( 'omits the detail when the pool has no exact figures', () => {
		expect( formatCreditsDetail( { id: 'free', label: 'Free', percent: 10 } ) ).toBeUndefined();
	} );

	it( 'formats credits left of total in short form', () => {
		expect(
			formatCreditsDetail( {
				id: 'plan',
				label: 'Monthly plan',
				percent: 72,
				remaining: 10850,
				total: 15000,
			} )
		).toBe( `${ localNumber( 10.8 ) }k of ${ localNumber( 15 ) }k credits left` );
		expect(
			formatCreditsDetail( {
				id: 'plan',
				label: 'Monthly plan',
				percent: 0.04,
				remaining: 1,
				total: 2500,
			} )
		).toBe( `${ localNumber( 1 ) } of ${ localNumber( 2.5 ) }k credits left` );
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

	it( 'gives paid plans the combined balance and top-ups without an expiry date', () => {
		expect( buildMockCreditsStatus( 'paid', 100 ).remaining ).toBe( 16000 );
		expect( buildMockCreditsStatus( 'paid', 5 ).remaining ).toBe( 800 );
		expect( buildMockCreditsStatus( 'paid', 0 ).remaining ).toBe( 0 );
		expect( pools( 100 ).plan.dateLabel ).toBe( 'Resets 17 Oct' );
		expect( pools( 100 ).topups ).not.toHaveProperty( 'dateLabel' );
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
