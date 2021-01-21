/**
 * Internal dependencies
 */
import { getSupportedPlans } from '../resolvers';
import { PLAN_FREE, PLAN_PREMIUM, PLAN_PREMIUM_MONTHLY } from '../constants';

// Don't need to mock specific functions for any tests, but mocking
// module because it accesses the `document` global.
jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
} ) );

describe( 'getSupportedPlans', () => {
	it( 'calls setFeatures, setFeaturesByType, and setPlans after fetching plans', () => {
		const iter = getSupportedPlans();

		const planPriceData = [
			{
				// This currency formats the symbol after the number
				// and rounds to 0 decimal places
				currency_code: 'INR',
				product_slug: PLAN_FREE,
				raw_price: 13,
				product_id: 1,
			},
			{
				// This currency formats the symbol after the number
				// and rounds to 0 decimal places
				currency_code: 'INR',
				product_slug: PLAN_PREMIUM,
				raw_price: 13,
				product_id: 2,
			},
			{
				// This currency formats the symbol after the number
				// and rounds to 0 decimal places
				currency_code: 'INR',
				product_slug: PLAN_PREMIUM_MONTHLY,
				raw_price: 13,
				product_id: 3,
			},
		];

		const planDetailedData = {
			groups: [],
			plans: [
				{
					products: [
						{
							plan_id: 1,
						},
						{
							plan_id: 2,
						},
						{
							plan_id: 3,
						},
					],
					features: [ 'custom-domain' ],
				},
			],
			features_by_type: [
				{
					id: 'general',
					name: null,
					features: [ 'custom-domain' ],
				},
			],
			features: [
				{
					id: 'custom-domain',
				},
			],
		};

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
		expect( iter.next( planPriceData ).value ).toEqual( {
			type: 'FETCH_AND_PARSE',
			resource: 'https://public-api.wordpress.com/wpcom/v2/plans/details?locale=en',
			options: {
				credentials: 'omit',
				mode: 'cors',
			},
		} );

		// setPlans call
		expect( iter.next( { body: planDetailedData } ).value ).toEqual( {
			type: 'SET_PLANS',
			plans: [
				{
					description: undefined,
					features: undefined,
					featuresSlugs: {
						'custom-domain': true,
					},
					isFree: false,
					isPopular: false,
					periodAgnosticSlug: undefined,
					productIds: [ 1, 2, 3 ],
					storage: undefined,
					title: undefined,
				},
			],
		} );

		// setPlanProducts call
		expect( iter.next().value ).toEqual( {
			products: [
				{
					billingPeriod: 'ANNUALLY',
					pathSlug: undefined,
					periodAgnosticSlug: undefined,
					price: '1₹',
					productId: 1,
					rawPrice: 13,
					storeSlug: 'free_plan',
				},
				{
					annualDiscount: 92,
					billingPeriod: 'ANNUALLY',
					pathSlug: undefined,
					periodAgnosticSlug: undefined,
					price: '1₹',
					productId: 2,
					rawPrice: 13,
					storeSlug: 'value_bundle',
				},
				{
					annualDiscount: 92,
					billingPeriod: 'ANNUALLY',
					pathSlug: undefined,
					periodAgnosticSlug: undefined,
					price: '1₹',
					productId: 3,
					rawPrice: 13,
					storeSlug: 'value_bundle_monthly',
				},
			],
			type: 'SET_PLAN_PRODUCTS',
		} );

		expect( iter.next().value ).toEqual( {
			type: 'SET_FEATURES',
			features: {
				'custom-domain': {
					id: 'custom-domain',
					name: undefined,
					description: undefined,
					type: 'checkbox',
				},
			},
		} );

		expect( iter.next().value ).toEqual( {
			type: 'SET_FEATURES_BY_TYPE',
			featuresByType: [ { id: 'general', name: null, features: [ 'custom-domain' ] } ],
		} );
	} );
} );
