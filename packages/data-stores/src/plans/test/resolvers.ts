/**
 * Internal dependencies
 */
import { getSupportedPlans } from '../resolvers';
import * as MockData from '../mock';
import { buildPlanFeaturesDict } from '../test-utils';

import type { PricedAPIPlan } from '../types';

// Don't need to mock specific functions for any tests, but mocking
// module because it accesses the `document` global.
jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
} ) );

const MOCK_LOCALE = 'test-locale';

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'Plans resolvers', () => {
	describe( 'getSupportedPlans', () => {
		it( 'should fetch APIs data and set features and plans data', () => {
			const iter = getSupportedPlans( MOCK_LOCALE );

			// Prepare stricter iterator types
			type IteratorReturnType = ReturnType< typeof iter.next >;
			type PlanPriceApiDataIterator = ( planPriceData: PricedAPIPlan[] ) => IteratorReturnType;
			type PlanDetailsApiDataIterator = ( { body: DetailsAPIResponse } ) => IteratorReturnType;

			// request to prices endpoint
			expect( iter.next().value ).toEqual( {
				request: {
					apiVersion: '1.5',
					path: '/plans',
					query: `locale=${ MOCK_LOCALE }`,
				},
				type: 'WPCOM_REQUEST',
			} );

			// request to plan details/features endpoint
			const planPriceApiData = [
				MockData.API_PLAN_PRICE_FREE,
				MockData.API_PLAN_PRICE_PREMIUM_ANNUALLY,
				MockData.API_PLAN_PRICE_PREMIUM_MONTHLY,
			];
			expect( ( iter.next as PlanPriceApiDataIterator )( planPriceApiData ).value ).toEqual( {
				type: 'FETCH_AND_PARSE',
				resource: `https://public-api.wordpress.com/wpcom/v2/plans/details?locale=${ MOCK_LOCALE }`,
				options: {
					credentials: 'omit',
					mode: 'cors',
				},
			} );

			// setPlans call
			const planDetailsApiData = {
				body: MockData.API_PLAN_DETAILS,
			};
			expect( ( iter.next as PlanDetailsApiDataIterator )( planDetailsApiData ).value ).toEqual( {
				locale: MOCK_LOCALE,
				type: 'SET_PLANS',
				plans: [ MockData.STORE_PLAN_FREE, MockData.STORE_PLAN_PREMIUM ],
			} );

			// setPlanProducts call
			expect( iter.next().value ).toEqual( {
				type: 'SET_PLAN_PRODUCTS',
				products: [
					MockData.STORE_PRODUCT_FREE,
					MockData.STORE_PRODUCT_PREMIUM_ANNUALLY,
					MockData.STORE_PRODUCT_PREMIUM_MONTHLY,
				],
			} );

			expect( iter.next().value ).toEqual( {
				locale: MOCK_LOCALE,
				type: 'SET_FEATURES',
				features: buildPlanFeaturesDict( [
					MockData.STORE_PLAN_FEATURE_CUSTOM_DOMAIN,
					MockData.STORE_PLAN_FEATURE_LIVE_SUPPORT,
					MockData.STORE_PLAN_FEATURE_PRIORITY_SUPPORT,
					MockData.STORE_PLAN_FEATURE_RECURRING_PAYMENTS,
					MockData.STORE_PLAN_FEATURE_WORDADS,
				] ),
			} );

			expect( iter.next().value ).toEqual( {
				locale: MOCK_LOCALE,
				type: 'SET_FEATURES_BY_TYPE',
				featuresByType: [
					MockData.API_FEATURES_BY_TYPE_GENERAL,
					MockData.API_FEATURES_BY_TYPE_COMMERCE,
					MockData.API_FEATURES_BY_TYPE_MARKETING,
				],
			} );
		} );

		it( 'should default to english locale', () => {
			const englishLocale = 'en';
			const iter = getSupportedPlans();

			// request to prices endpoint
			expect( iter.next().value ).toEqual( {
				request: {
					apiVersion: '1.5',
					path: '/plans',
					query: `locale=${ englishLocale }`,
				},
				type: 'WPCOM_REQUEST',
			} );
		} );
	} );
} );
