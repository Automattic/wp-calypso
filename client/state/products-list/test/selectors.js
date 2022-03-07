import { getPlan, TERM_MONTHLY, TERM_ANNUALLY } from '@automattic/calypso-products';
import deepFreeze from 'deep-freeze';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import getIntroOfferIsEligible from 'calypso/state/selectors/get-intro-offer-is-eligible';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import {
	computeFullAndMonthlyPricesForPlan,
	computeProductsWithPrices,
	getPlanPrice,
	getProductDisplayCost,
	getProductSaleCouponCost,
	getProductSaleCouponDiscount,
	isProductsListFetching,
	planSlugToPlanProduct,
} from '../selectors';

jest.mock( 'calypso/state/selectors/get-intro-offer-price', () => jest.fn() );
jest.mock( 'calypso/state/selectors/get-intro-offer-is-eligible', () => jest.fn() );
jest.mock( 'calypso/state/selectors/get-intro-offer-is-eligible', () => jest.fn() );

jest.mock( 'calypso/state/products-list/selectors/get-product-sale-coupon-cost', () => ( {
	getProductSaleCouponCost: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/products-list/selectors/get-product-sale-coupon-discount', () => ( {
	getProductSaleCouponDiscount: jest.fn( () => null ),
} ) );

jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getPlanDiscountedRawPrice: jest.fn(),
	isIntroductoryOfferAppliedToPlanPrice: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	applyTestFiltersToPlansList: jest.fn( ( x ) => x ),
	getPlan: jest.fn(),
} ) );

jest.mock( 'calypso/state/plans/selectors', () => ( {
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
		beforeEach( () => {
			getIntroOfferPrice.mockReset();
			getIntroOfferPrice.mockImplementation( () => null );
			getIntroOfferIsEligible.mockReset();
			getIntroOfferIsEligible.mockImplementation( () => false );
			getProductSaleCouponCost.mockReset();
			getProductSaleCouponCost.mockImplementation( () => false );
			getProductSaleCouponDiscount.mockReset();
			getProductSaleCouponDiscount.mockImplementation( () => false );
		} );
		test( 'Should return shape { priceFull }', () => {
			getPlanDiscountedRawPrice.mockImplementation( ( a, b, c, { isMonthly } ) =>
				isMonthly ? 10 : 120
			);
			getPlanRawPrice.mockImplementation( () => 150 );

			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan ) ).toEqual( {
				introductoryOfferPrice: null,
				priceFull: 120,
				priceFinal: 120,
			} );
		} );

		test( 'Should return the introductoryOfferPrice value', () => {
			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			getIntroOfferPrice.mockImplementation( () => 60 );
			getIntroOfferIsEligible.mockImplementation( () => true );
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan ) ).toEqual( {
				introductoryOfferPrice: 60,
				priceFull: 120,
				priceFinal: 120,
			} );
		} );

		test( 'Should not return the introductoryOfferPrice value if ineligible', () => {
			const plan = { getStoreSlug: () => 'abc', getProductId: () => 'def' };
			getIntroOfferPrice.mockImplementation( () => 60 );
			getIntroOfferIsEligible.mockImplementation( () => false );
			expect( computeFullAndMonthlyPricesForPlan( {}, 1, plan ) ).toEqual( {
				introductoryOfferPrice: null,
				priceFull: 120,
				priceFinal: 120,
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

			getIntroOfferPrice.mockReset();
			getIntroOfferPrice.mockImplementation( () => null );

			getProductSaleCouponCost.mockReset();
			getProductSaleCouponCost.mockImplementation( () => null );

			getProductSaleCouponDiscount.mockReset();
			getProductSaleCouponDiscount.mockImplementation( () => null );
		} );

		test( 'Should return list of shapes { priceFull, priceFinal, plan, product, planSlug, introductoryOfferPrice }', () => {
			const state = {
				productsList: {
					items: {
						plan1: { available: true },
						plan2: { available: true },
					},
				},
			};

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ] ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFull: 120,
					priceFinal: 120,
					introductoryOfferPrice: null,
				},
				{
					planSlug: 'plan2',
					plan: testPlans.plan2,
					product: state.productsList.items.plan2,
					priceFull: 240,
					priceFinal: 240,
					introductoryOfferPrice: null,
				},
			] );
		} );

		test( 'sales coupon should discount priceFinal', () => {
			getProductSaleCouponCost.mockImplementation( ( _, storeSlug ) => {
				if ( storeSlug === 'abc' ) {
					return 100;
				}
				return null;
			} );

			const state = {
				productsList: {
					items: {
						plan1: { available: true },
						plan2: { available: true },
					},
				},
			};

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ] ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFull: 120,
					priceFinal: 100,
					introductoryOfferPrice: null,
				},
				{
					planSlug: 'plan2',
					plan: testPlans.plan2,
					product: state.productsList.items.plan2,
					priceFull: 240,
					priceFinal: 240,
					introductoryOfferPrice: null,
				},
			] );
		} );

		test( 'sales coupon should discount priceFinal with introductoryOffer', () => {
			getProductSaleCouponDiscount.mockImplementation( ( _, storeSlug ) => {
				if ( storeSlug === 'jkl' ) {
					return 0.3;
				}
				return null;
			} );
			getProductSaleCouponCost.mockImplementation( ( _, storeSlug ) => {
				if ( storeSlug === 'jkl' ) {
					return 168;
				}
				return null;
			} );
			getIntroOfferPrice.mockImplementation( ( _, productId ) => {
				if ( productId === 'mno' ) {
					return 120;
				}
				return null;
			} );
			getIntroOfferIsEligible.mockImplementation( () => true );

			const state = {
				productsList: {
					items: {
						plan1: { available: true },
						plan2: { available: true },
					},
				},
			};

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ] ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFull: 120,
					priceFinal: 120,
					introductoryOfferPrice: null,
				},
				{
					planSlug: 'plan2',
					plan: testPlans.plan2,
					product: state.productsList.items.plan2,
					priceFull: 240,
					priceFinal: 168,
					introductoryOfferPrice: 84,
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

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ] ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFinal: 120,
					priceFull: 120,
					introductoryOfferPrice: null,
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

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ] ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFull: 120,
					priceFinal: 120,
					introductoryOfferPrice: null,
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

			expect( computeProductsWithPrices( state, 10, [ 'plan1', 'plan2' ] ) ).toEqual( [
				{
					planSlug: 'plan1',
					plan: testPlans.plan1,
					product: state.productsList.items.plan1,
					priceFull: 120,
					priceFinal: 120,
					introductoryOfferPrice: null,
				},
			] );
		} );
	} );

	describe( '#getProductDisplayCost()', () => {
		test( 'should return null when the products list has not been fetched', () => {
			const state = deepFreeze( { productsList: { items: {} } } );

			expect( getProductDisplayCost( state, 'business-bundle' ) ).toBe( null );
		} );

		test( 'should return the display cost', () => {
			const state = deepFreeze( {
				productsList: {
					items: {
						'business-bundle': {
							cost_display: 'A$169.00',
						},
					},
				},
			} );

			expect( getProductDisplayCost( state, 'business-bundle' ) ).toBe( 'A$169.00' );
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
