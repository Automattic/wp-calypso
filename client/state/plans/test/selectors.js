
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPlans,
	isRequestingPlans,
	getPlan,
	getPlanPriceObject
} from '../selectors';

/**
 * Fixture data
 */
import {
	PLANS,
	getStateInstance
} from './fixture';

describe( 'selectors', () => {
	describe( '#getPlans()', () => {
		it( 'should return WordPress Plans array', () => {
			const state = getStateInstance();
			const plans = getPlans( state );
			expect( plans ).to.eql( PLANS );
		} );
	} );

	describe( '#isRequestingPlans()', () => {
		it( 'should return requesting state of Plans', () => {
			const state = getStateInstance();
			const isRequesting = isRequestingPlans( state );
			expect( isRequesting ).to.eql( false );
		} );
	} );

	describe( '#getPlan()', () => {
		it( 'should return a plan when given a product id', () => {
			const state = getStateInstance();
			expect( getPlan( state, 1003 ).product_id ).to.eql( 1003 );
			expect( getPlan( state, 2002 ).product_id ).to.eql( 2002 );
		} );
		it( 'should return undefined when given an unknown product id', () => {
			const state = getStateInstance();
			expect( getPlan( state, 44 ) ).to.eql( undefined );
		} );
	} );

	describe( '#getPlanPriceObject()', () => {
		it( 'should return price plan object', () => {
			const state = getStateInstance();
			const priceObject = getPlanPriceObject( state, 1003 );
			expect( priceObject ).to.eql( {
				currencySymbol: '$',
				decimalMark: '.',
				dollars: 99,
				cents: 0
			} );
		} );
		it( 'should return monthly price plan object', () => {
			const state = getStateInstance();
			const priceObject = getPlanPriceObject( state, 1003, true );
			expect( priceObject ).to.eql( {
				currencySymbol: '$',
				decimalMark: '.',
				dollars: 8,
				cents: 25
			} );
		} );
		it( 'should return null when plan is not available', () => {
			const state = getStateInstance();
			const priceObject = getPlanPriceObject( state, 44, true );
			expect( priceObject ).to.eql( null );
		} );
		it( 'should handle JPY localization correctly', () => {
			const state = {
				plans: {
					items: [ {
						product_id: 2000,
						product_name: 'Premium',
						formatted_price: '¥11,800',
						raw_price: 11800
					} ],
					requesting: false,
					error: false
				}
			};
			const priceObject = getPlanPriceObject( state, 2000, true );
			expect( priceObject ).to.eql( {
				currencySymbol: '¥',
				decimalMark: '.',
				dollars: 983,
				cents: 0
			} );
		} );
		it( 'should handle AUD localization correctly', () => {
			const state = {
				plans: {
					items: [ {
						product_id: 2000,
						product_name: 'Premium',
						formatted_price: 'A$99',
						raw_price: 99
					} ],
					requesting: false,
					error: false
				}
			};
			const priceObject = getPlanPriceObject( state, 2000, true );
			expect( priceObject ).to.eql( {
				currencySymbol: 'A$',
				decimalMark: '.',
				dollars: 8,
				cents: 25
			} );
		} );
		it( 'should handle CAD localization correctly', () => {
			const state = {
				plans: {
					items: [ {
						product_id: 2000,
						product_name: 'Premium',
						formatted_price: 'C$99',
						raw_price: 99
					} ],
					requesting: false,
					error: false
				}
			};
			const priceObject = getPlanPriceObject( state, 2000, true );
			expect( priceObject ).to.eql( {
				currencySymbol: 'C$',
				decimalMark: '.',
				dollars: 8,
				cents: 25
			} );
		} );
	} );
} );
