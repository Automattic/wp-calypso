import {
	type CreditsStatus,
	buildMockCreditsStatus,
	clampPercent,
	formatCreditsDetail,
	formatCreditsLeft,
	formatCreditsShort,
	formatPercent,
	getAgentEnvironment,
	getCreditsLabel,
	getCreditsToggleLabel,
	getTopUpCreditsLeft,
	isCreditsAlert,
	isCreditsExhausted,
	isCreditsLow,
} from '../credits';
import { localNumber } from './fixtures/local-number';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_n: ( single: string, plural: string, count: number ) => ( count === 1 ? single : plural ),
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
	it( 'reads low by percentage on free plans and by amount on paid plans', () => {
		expect( isCreditsLow( free( 20 ) ) ).toBe( true );
		expect( isCreditsLow( free( 21 ) ) ).toBe( false );
		expect( isCreditsLow( free( 0 ) ) ).toBe( false );
		expect( isCreditsLow( paid( 5 ) ) ).toBe( true );
		expect( isCreditsLow( paid( 100, 10000 ) ) ).toBe( false );
		expect( isCreditsLow( paid( 100, 9999 ) ) ).toBe( true );
		expect( isCreditsLow( paid( 0, 0 ) ) ).toBe( false );
		expect( isCreditsLow( { ...paid( 0 ), remaining: 25000 } ) ).toBe( false );
	} );

	it( 'reads exhausted only at an exact zero, for any plan', () => {
		expect( isCreditsExhausted( free( 0 ) ) ).toBe( true );
		expect( isCreditsExhausted( paid( 0 ) ) ).toBe( true );
		expect( isCreditsExhausted( { ...paid( 0 ), remaining: 1 } ) ).toBe( false );
		expect( isCreditsExhausted( free( 0.4 ) ) ).toBe( false );
		expect( isCreditsExhausted( free( 1 ) ) ).toBe( false );
	} );
} );

describe( 'isCreditsAlert', () => {
	it.each( [
		[ 100, false ],
		[ 20.01, false ],
		[ 20, true ],
		[ 19.99, true ],
		[ 0.4, true ],
		[ 0, true ],
	] )( 'uses the unrounded free share at %s%%', ( percent, isAlert ) => {
		expect( isCreditsAlert( free( percent ) ) ).toBe( isAlert );
	} );

	it.each( [
		[ 25000, false ],
		[ 10000, false ],
		[ 9999, true ],
		[ 800, true ],
		[ 1, true ],
		[ 0, true ],
	] )( 'uses the paid amount at %i credits', ( remaining, isAlert ) => {
		expect( isCreditsAlert( paid( 100, remaining ) ) ).toBe( isAlert );
	} );

	it( 'ignores the plan share on paid plans', () => {
		expect( isCreditsAlert( { ...paid( 10 ), remaining: 205000 } ) ).toBe( false );
		expect( isCreditsAlert( { ...paid( 0 ), remaining: 25000 } ) ).toBe( false );
	} );
} );

describe( 'getTopUpCreditsLeft', () => {
	const withTopUps = ( remaining: number ): CreditsStatus => ( {
		...paid( 0, remaining ),
		pools: [ ...paid( 0 ).pools, { id: 'topups', label: 'Top-ups', remaining } ],
	} );

	it( 'sends the top-ups row’s balance', () => {
		expect( getTopUpCreditsLeft( withTopUps( 67000 ) ) ).toBe( 67000 );
	} );

	it( 'sends 0, not none, for a used-up pack', () => {
		expect( getTopUpCreditsLeft( withTopUps( 0 ) ) ).toBe( 0 );
	} );

	it.each( [
		[ 'a paid plan', paid( 50 ) ],
		[ 'a free plan', free( 50 ) ],
	] )( 'sends none for %s without a top-ups row', ( _plan, status ) => {
		expect( getTopUpCreditsLeft( status ) ).toBe( 'none' );
	} );
} );

describe( 'getAgentEnvironment', () => {
	it( 'sends the client context environment unchanged', () => {
		expect(
			getAgentEnvironment( { getClientContext: () => ( { environment: 'image-studio' } ) } )
		).toBe( 'image-studio' );
	} );

	it.each( [
		[ 'no context provider', undefined ],
		[ 'no environment', { getClientContext: () => ( {} ) } ],
		[ 'an empty environment', { getClientContext: () => ( { environment: '' } ) } ],
		[
			'a context that throws',
			{
				getClientContext: () => {
					throw new Error( 'No store' );
				},
			},
		],
	] )( 'sends none for %s', ( _case, contextProvider ) => {
		expect( getAgentEnvironment( contextProvider ) ).toBe( 'none' );
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

describe( 'formatCreditsLeft', () => {
	it( 'reads an amount as a short sentence, singular only for exactly one credit', () => {
		expect( formatCreditsLeft( 67000 ) ).toBe( `${ localNumber( 67 ) }k credits left` );
		expect( formatCreditsLeft( 1 ) ).toBe( `${ localNumber( 1 ) } credit left` );
		expect( formatCreditsLeft( 0 ) ).toBe( `${ localNumber( 0 ) } credits left` );
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

	it( 'uses the singular only for exactly one credit', () => {
		expect( getCreditsLabel( paid( 0, 1 ) ) ).toBe( `${ localNumber( 1 ) } credit left` );
		expect( getCreditsLabel( paid( 0 ) ) ).toBe( `${ localNumber( 0 ) } credits left` );
		expect( getCreditsLabel( paid( 0, 2 ) ) ).toBe( `${ localNumber( 2 ) } credits left` );
	} );
} );

describe( 'getCreditsToggleLabel', () => {
	it( 'gives the amount alone while credits are fine', () => {
		expect( getCreditsToggleLabel( paid( 0, 12000 ) ) ).toBe(
			`${ localNumber( 12 ) }k credits left`
		);
		expect( getCreditsToggleLabel( free( 55 ) ) ).toBe( '55% of free credits left' );
	} );

	it( 'leads with the state when credits are low or out', () => {
		expect( getCreditsToggleLabel( paid( 0, 9999 ) ) ).toBe(
			`Low on credits: ${ localNumber( 9.9 ) }k credits left`
		);
		expect( getCreditsToggleLabel( free( 0.4 ) ) ).toBe(
			'Low on credits: <1% of free credits left'
		);
		expect( getCreditsToggleLabel( paid( 0 ) ) ).toBe(
			`Out of credits: ${ localNumber( 0 ) } credits left`
		);
		expect( getCreditsToggleLabel( free( 0 ) ) ).toBe( 'Out of credits: 0% of free credits left' );
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

	it( 'picks the plural by the pool total, not by the credits left', () => {
		expect(
			formatCreditsDetail( {
				id: 'plan',
				label: 'Monthly plan',
				percent: 0,
				remaining: 0,
				total: 1,
			} )
		).toBe( `${ localNumber( 0 ) } of ${ localNumber( 1 ) } credit left` );
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
		expect( pools( 0 ).topups.remaining ).toBe( 0 );
	} );

	it( 'gives paid top-ups their balance alone, like a live site', () => {
		expect( pools( 50 ).topups ).toEqual( { id: 'topups', label: 'Top-ups', remaining: 1000 } );
		expect( pools( 0 ).topups ).toEqual( { id: 'topups', label: 'Top-ups', remaining: 0 } );
	} );
} );
