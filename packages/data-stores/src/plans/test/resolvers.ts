/**
 * Internal dependencies
 */
import { getPrices, getPlansDetails } from '../resolvers';
import { PLAN_FREE } from '../constants';

describe( 'getPrices', () => {
	it( 'calls setPrices after fetching prices', () => {
		const iter = getPrices();

		expect( iter.next().value ).toEqual( {
			type: 'API_FETCH',
			request: expect.objectContaining( { url: expect.stringMatching( /\/plans$/ ) } ),
		} );

		const planData = [
			{
				// This currency formats the symbol before the number
				// and rounds to 2 decimal places
				currency_code: 'USD',
				product_slug: PLAN_FREE,
				raw_price: 14,
			},
		];

		expect( iter.next( planData ).value ).toEqual( {
			type: 'SET_PRICES',
			prices: {
				[ PLAN_FREE ]: '$1.17',
			},
		} );
	} );

	it( 'formats some currency symbols after the number', () => {
		const iter = getPrices();

		expect( iter.next().value ).toEqual( {
			type: 'API_FETCH',
			request: expect.objectContaining( { url: expect.stringMatching( /\/plans$/ ) } ),
		} );

		const planData = [
			{
				// This currency formats the symbol after the number
				// and rounds to 0 decimal places
				currency_code: 'INR',
				product_slug: PLAN_FREE,
				raw_price: 13,
			},
		];

		expect( iter.next( planData ).value ).toEqual( {
			type: 'SET_PRICES',
			prices: {
				[ PLAN_FREE ]: '1₹',
			},
		} );
	} );
} );

describe( 'getPlanDetails', () => {
	it( 'loads plan data into the store', () => {
		const iter = getPlansDetails( 'en' );

		expect( iter.next().value ).toEqual( {
			type: 'API_FETCH',
			request: expect.objectContaining( {
				url: expect.stringMatching( /\/plans\/details\?locale=en$/ ),
			} ),
		} );

		const planDetailsData = {
			plans: [
				{
					short_name: 'free',
					tagline: 'free forever',
					products: [ { plan_id: 1 } ],
					nonlocalized_short_name: 'Free',
					highlighted_features: [],
					features: [],
				},
			],
			features: [
				{
					id: 'feature_id',
					name: 'Feature Name',
				},
			],
			features_by_type: [
				{
					id: PLAN_FREE,
					features: [ 'feature_id' ],
				},
			],
		};

		expect( iter.next( planDetailsData ).value ).toEqual( {
			type: 'SET_PLANS',
			plans: expect.objectContaining( {
				[ PLAN_FREE ]: expect.objectContaining( {
					storeSlug: PLAN_FREE,
				} ),
			} ),
		} );

		expect( iter.next().value ).toEqual( {
			type: 'SET_FEATURES',
			features: expect.objectContaining( {
				feature_id: expect.objectContaining( {
					id: 'feature_id',
					name: 'Feature Name',
				} ),
			} ),
		} );

		expect( iter.next().value ).toEqual( {
			type: 'SET_FEATURES_BY_TYPE',
			featuresByType: [
				{
					id: PLAN_FREE,
					features: [ 'feature_id' ],
				},
			],
		} );
	} );
} );
