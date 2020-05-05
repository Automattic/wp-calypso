/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getProductDisplayCost,
	isProductsListFetching,
	getPlanPrice,
	planSlugToPlanProduct,
	computeFullAndMonthlyPricesForPlan,
	computeProductsWithPrices,
} from '../selectors';

import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { getPlanRawPrice } from 'state/plans/selectors';
import { TERM_MONTHLY, TERM_ANNUALLY } from 'lib/plans/constants';
const plans = require( 'lib/plans' );

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'state/sites/plans/selectors', () => ( {
	getPlanDiscountedRawPrice: jest.fn(),
} ) );

plans.applyTestFiltersToPlansList = jest.fn( ( x ) => x );
plans.getPlan = jest.fn();

const { getPlan } = plans;

jest.mock( 'state/plans/selectors', () => ( {
	getPlanRawPrice: jest.fn(),
} ) );

describe( 'selectors', () => {
	describe( '#getPlanPrice()', () => {
		beforeEach( () => {
			getPlanDiscountedRawPrice.mockReset();
			getPlanDiscountedRawPrice.mockImplementation( () => 12 );

			getPlanRawPrice.mockReset();
			getPlanRawPrice.mockImplementation( () => 50 );
		} );

		test( 'Should return discounted price if available', () => {
			const plan = { getStoreSlug: () => 'abc' };
			expect( getPlanPrice( {}, 1, plan ) ).toBe( 12 );
		} );

		test( 'Should pass correct arguments to getPlanDiscountedRawPrice', () => {
			const plan = { getStoreSlug: () => 'abc' };
			getPlanPrice( { state: 1 }, 1, plan, false );
			expect( getPlanDiscountedRawPrice.mock.calls[ 0 ] ).toEqual( [
				{ state: 1 },
				1,
				'abc',
				{ isMonthly: false },
			] );
		} );

		test( 'Should return raw price if no discount available', () => {
			getPlanDiscountedRawPrice.mockImplementation( () => null );

			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			expect( getPlanPrice( {}, 1, plan, false ) ).toBe( 50 );
		} );

		test( 'Should pass correct arguments to getPlanRawPrice', () => {
			getPlanDiscountedRawPrice.mockImplementation( () => null );

			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			getPlanPrice( { state: 1 }, 1, plan, false );
			expect( getPlanRawPrice.mock.calls[ 0 ] ).toEqual( [ { state: 1 }, 'def', false ] );
		} );

		test( 'Should pass correct isMonthly value', () => {
			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			getPlanPrice( {}, 1, plan, false );
			expect( getPlanDiscountedRawPrice.mock.calls[ 0 ][ 3 ] ).toEqual( { isMonthly: false } );

			getPlanPrice( {}, 1, plan, true );
			expect( getPlanDiscountedRawPrice.mock.calls[ 1 ][ 3 ] ).toEqual( { isMonthly: true } );

			getPlanPrice( {}, 1, { ...plan, term: TERM_MONTHLY }, true );
			expect( getPlanDiscountedRawPrice.mock.calls[ 2 ][ 3 ] ).toEqual( { isMonthly: true } );
		} );
	} );

	describe( '#planSlugToPlanProduct()', () => {
		test( 'Should return shape { planSlug, plan, product }', () => {
			const products = {
				myPlanSlug: {
					price: 10,
				},
			};
			const planSlug = 'myPlanSlug';
			const plan = {
				storeId: 15,
			};
			getPlan.mockImplementation( () => plan );

			expect( planSlugToPlanProduct( products, planSlug ) ).toEqual( {
				planSlug,
				plan,
				product: products.myPlanSlug,
			} );
		} );

		test( 'Should return shape { planSlug, plan, product } with empty values if plan or product couldnt be found', () => {
			const planSlug = 'myPlanSlug';
			getPlan.mockImplementation( () => null );

			expect( planSlugToPlanProduct( {}, planSlug ) ).toEqual( {
				planSlug,
				plan: null,
				product: undefined,
			} );

			expect( planSlugToPlanProduct( { myPlanSlug: null }, planSlug ) ).toEqual( {
				planSlug,
				plan: null,
				product: null,
			} );
		} );
	} );

	describe( '#computeFullAndMonthlyPricesForPlan()', () => {
		test( 'Should return shape { priceFull, priceMonthly }', () => {
			getPlanDiscountedRawPrice.mockImplementation( ( a, b, c, { isMonthly } ) =>
				isMonthly ? 10 : 120
			);
			getPlanRawPrice.mockImplementation( () => 150 );

			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan, 0, {} ) ).toEqual( {
				priceFullBeforeDiscount: 150,
				priceFull: 120,
				priceFinal: 120,
				priceMonthly: 10,
			} );
		} );

		test( 'Should return proper priceFinal if couponDiscounts are provided', () => {
			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan, 0, { def: 60 } ) ).toEqual( {
				priceFullBeforeDiscount: 150,
				priceFull: 120,
				priceFinal: 60,
				priceMonthly: 10, // The monthly price is without discounts applied
			} );
		} );
	} );

	describe( '#computeProductsWithPrices()', () => {
		const testPlans = {
			plan1: {
				id: 1,
				term: TERM_MONTHLY,
				getStoreSlug: () => 'abc',
				getProductId: () => 'def',
			},

			plan2: {
				id: 2,
				term: TERM_ANNUALLY,
				getStoreSlug: () => 'jkl',
				getProductId: () => 'mno',
			},
		};

		beforeEach( () => {
			getPlanRawPrice.mockImplementation( () => 150 );
			getPlanDiscountedRawPrice.mockImplementation( ( a, b, storeSlug, { isMonthly } ) => {
				if ( storeSlug === 'abc' ) {
					return isMonthly ? 10 : 120;
				}

				return isMonthly ? 20 : 240;
			} );

			getPlan.mockImplementation( ( slug ) => testPlans[ slug ] );
		} );

		test( 'Should return list of shapes { priceFull, priceFullBeforeDiscount, priceMonthly, plan, product, planSlug }', () => {
			const state = {
				productsList: {
					items: {
						plan1: { available: true },
						plan2: { available: true },
					},
				},
			};

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ], 0, {} ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFullBeforeDiscount: 150,
					priceFull: 120,
					priceFinal: 120,
					priceMonthly: 10,
				},
				{
					planSlug: 'plan2',
					plan: testPlans.plan2,
					product: state.productsList.items.plan2,
					priceFullBeforeDiscount: 150,
					priceFull: 240,
					priceFinal: 240,
					priceMonthly: 20,
				},
			] );
		} );

		test( 'couponDiscount should discount priceFinal', () => {
			const state = {
				productsList: {
					items: {
						plan1: { available: true },
						plan2: { available: true },
					},
				},
			};

			expect(
				computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ], 0, { def: 60, mno: 120 } )
			).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFullBeforeDiscount: 150,
					priceFull: 120,
					priceFinal: 60,
					priceMonthly: 10,
				},
				{
					planSlug: 'plan2',
					plan: testPlans.plan2,
					product: state.productsList.items.plan2,
					priceFullBeforeDiscount: 150,
					priceFull: 240,
					priceFinal: 120,
					priceMonthly: 20,
				},
			] );
		} );

		test( 'Should filter out unavailable products', () => {
			const state = {
				productsList: {
					items: {
						plan1: { available: true },
						plan2: { available: false },
					},
				},
			};

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ], 0, {} ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFullBeforeDiscount: 150,
					priceFinal: 120,
					priceFull: 120,
					priceMonthly: 10,
				},
			] );
		} );

		test( 'Should filter out unavailable not found products', () => {
			const state = {
				productsList: {
					items: {
						plan1: { available: true },
					},
				},
			};

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ], 0, {} ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFullBeforeDiscount: 150,
					priceFull: 120,
					priceFinal: 120,
					priceMonthly: 10,
				},
			] );
		} );

		test( 'Should filter out unavailable not found products with no price', () => {
			getPlanDiscountedRawPrice.mockImplementation( ( a, b, storeSlug, { isMonthly } ) => {
				if ( storeSlug === 'abc' ) {
					return isMonthly ? 10 : 120;
				}
			} );
			getPlanRawPrice.mockImplementation( ( a, productId ) => {
				if ( productId === 'def' ) {
					return 150;
				}
			} );

			const state = {
				productsList: {
					items: {
						plan1: { available: true },
						plan2: { available: true },
					},
				},
			};

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ], 0, {} ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFullBeforeDiscount: 150,
					priceFull: 120,
					priceFinal: 120,
					priceMonthly: 10,
				},
			] );
		} );
	} );

	describe( '#getProductDisplayCost()', () => {
		test( 'should return null when the products list has not been fetched', () => {
			const state = deepFreeze( { productsList: { items: {} } } );

			expect( getProductDisplayCost( state, 'guided_transfer' ) ).toBe( null );
		} );

		test( 'should return the display cost', () => {
			const state = deepFreeze( {
				productsList: {
					items: {
						guided_transfer: {
							cost_display: 'A$169.00',
						},
					},
				},
			} );

			expect( getProductDisplayCost( state, 'guided_transfer' ) ).toBe( 'A$169.00' );
		} );
	} );

	describe( '#isProductsListFetching()', () => {
		test( 'should return false when productsList.isFetching is false', () => {
			const state = { productsList: { isFetching: false } };
			expect( isProductsListFetching( state ) ).toBe( false );
		} );

		test( 'should return true when productsList.isFetching is true', () => {
			const state = { productsList: { isFetching: true } };
			expect( isProductsListFetching( state ) ).toBe( true );
		} );
	} );
} );
