/**
 * Internal dependencies
 */
import { getSupportedPlans } from '../resolvers';
import {
	MOCK_PLAN_PRICE_APIS_FREE,
	MOCK_PLAN_PRICE_APIS_PREMIUM_ANNUALLY,
	MOCK_PLAN_PRICE_APIS_PREMIUM_MONTHLY,
	MOCK_PLAN_DETAILS_API,
	MOCK_PLAN_FREE,
	MOCK_PLAN_PREMIUM,
	MOCK_PLAN_PRODUCT_FREE,
	MOCK_PLAN_PRODUCT_PREMIUM_ANNUALLY,
	MOCK_PLAN_PRODUCT_PREMIUM_MONTHLY,
	MOCK_FEATURE_CUSTOM_DOMAIN,
	MOCK_FEATURE_LIVE_SUPPORT,
	MOCK_FEATURE_PRIORITY_SUPPORT,
	MOCK_FEATURE_RECURRING_PAYMENTS,
	MOCK_FEATURE_WORDADS,
	MOCK_FEATURES_BY_TYPE_GENERAL,
	MOCK_FEATURES_BY_TYPE_COMMERCE,
	MOCK_FEATURES_BY_TYPE_MARKETING,
} from '../mock/mock-constants';

import type { PricedAPIPlan } from '../types';

// Don't need to mock specific functions for any tests, but mocking
// module because it accesses the `document` global.
jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
} ) );

describe( 'getSupportedPlans', () => {
	it( 'calls setFeatures, setFeaturesByType, and setPlans after fetching plans', () => {
		const iter = getSupportedPlans();

		// Prepare stricter iterator types
		type IteratorReturnType = ReturnType< typeof iter.next >;
		type PlanPriceApiDataIterator = ( planPriceData: PricedAPIPlan[] ) => IteratorReturnType;
		type PlanDetailsApiDataIterator = ( { body: DetailsAPIResponse } ) => IteratorReturnType;

		// request to prices endpoint
		expect( iter.next().value ).toEqual( {
			request: {
				apiVersion: '1.5',
				path: '/plans',
				query: 'locale=en',
			},
			type: 'WPCOM_REQUEST',
		} );

		// request to plan details/features endpoint
		const planPriceApiData = [
			MOCK_PLAN_PRICE_APIS_FREE,
			MOCK_PLAN_PRICE_APIS_PREMIUM_ANNUALLY,
			MOCK_PLAN_PRICE_APIS_PREMIUM_MONTHLY,
		];
		expect( ( iter.next as PlanPriceApiDataIterator )( planPriceApiData ).value ).toEqual( {
			type: 'FETCH_AND_PARSE',
			resource: 'https://public-api.wordpress.com/wpcom/v2/plans/details?locale=en',
			options: {
				credentials: 'omit',
				mode: 'cors',
			},
		} );

		// setPlans call
		const planDetailsApiData = {
			body: MOCK_PLAN_DETAILS_API,
		};
		expect( ( iter.next as PlanDetailsApiDataIterator )( planDetailsApiData ).value ).toEqual( {
			locale: 'en',
			type: 'SET_PLANS',
			plans: [ MOCK_PLAN_FREE, MOCK_PLAN_PREMIUM ],
		} );

		// setPlanProducts call
		expect( iter.next().value ).toEqual( {
			type: 'SET_PLAN_PRODUCTS',
			products: [
				MOCK_PLAN_PRODUCT_FREE,
				MOCK_PLAN_PRODUCT_PREMIUM_ANNUALLY,
				MOCK_PLAN_PRODUCT_PREMIUM_MONTHLY,
			],
		} );

		expect( iter.next().value ).toEqual( {
			locale: 'en',
			type: 'SET_FEATURES',
			features: [
				MOCK_FEATURE_CUSTOM_DOMAIN,
				MOCK_FEATURE_LIVE_SUPPORT,
				MOCK_FEATURE_PRIORITY_SUPPORT,
				MOCK_FEATURE_RECURRING_PAYMENTS,
				MOCK_FEATURE_WORDADS,
			].reduce(
				( dict, feature ) => ( {
					...dict,
					[ feature.id ]: {
						...feature,
						type: 'checkbox',
						requiresAnnuallyBilledPlan:
							feature.id === MOCK_FEATURE_CUSTOM_DOMAIN.id ||
							feature.id === MOCK_FEATURE_LIVE_SUPPORT.id ||
							feature.id === MOCK_FEATURE_PRIORITY_SUPPORT.id,
					},
				} ),
				{}
			),
		} );

		expect( iter.next().value ).toEqual( {
			locale: 'en',
			type: 'SET_FEATURES_BY_TYPE',
			featuresByType: [
				MOCK_FEATURES_BY_TYPE_GENERAL,
				MOCK_FEATURES_BY_TYPE_COMMERCE,
				MOCK_FEATURES_BY_TYPE_MARKETING,
			],
		} );
	} );
} );
