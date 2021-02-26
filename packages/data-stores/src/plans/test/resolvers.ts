/**
 * Internal dependencies
 */
import { getSupportedPlans } from '../resolvers';
import * as MockData from '../mock';
import { buildPlanFeaturesDict } from '../test-utils';

import type { PricedAPIPlan } from '../types';

jest.mock( '../../wpcom-request-controls', () => ( {
	wpcomRequest: ( request ) => ( {
		type: 'WPCOM_REQUEST',
		request,
	} ),
	fetchAndParse: ( resource, options ) => ( {
		type: 'FETCH_AND_PARSE',
		resource,
		options,
	} ),
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
			MockData.API_PLAN_PRICE_FREE,
			MockData.API_PLAN_PRICE_PREMIUM_ANNUALLY,
			MockData.API_PLAN_PRICE_PREMIUM_MONTHLY,
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
			body: MockData.API_PLAN_DETAILS,
		};
		expect( ( iter.next as PlanDetailsApiDataIterator )( planDetailsApiData ).value ).toEqual( {
			locale: 'en',
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
			locale: 'en',
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
			locale: 'en',
			type: 'SET_FEATURES_BY_TYPE',
			featuresByType: [
				MockData.API_FEATURES_BY_TYPE_GENERAL,
				MockData.API_FEATURES_BY_TYPE_COMMERCE,
				MockData.API_FEATURES_BY_TYPE_MARKETING,
			],
		} );
	} );
} );
