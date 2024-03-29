import { getPopularPlanSpec } from '../src';
import { GROUP_WPCOM, TYPE_BUSINESS, TYPE_PREMIUM, TYPE_PERSONAL } from '../src/constants';

describe( 'getPopularPlanSpec()', () => {
	const availablePlans = [
		'personal-bundle',
		'value_bundle',
		'business-bundle',
		'ecommerce-bundle',
	];

	test( 'Should return biz for empty customer type', () => {
		expect(
			getPopularPlanSpec( {
				availablePlans,
			} )
		).toEqual( {
			type: TYPE_BUSINESS,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'Should return premium for personal customer type', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'personal',
				availablePlans,
			} )
		).toEqual( {
			type: TYPE_PREMIUM,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'Should return the first available plan for personal customer type if the premium plan is not available', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'personal',
				availablePlans: [ 'business-bundle', 'ecommerce-bundle' ],
			} )
		).toEqual( {
			type: TYPE_BUSINESS,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'should return false when there is no available plans.', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'business',
				availablePlans: [],
			} )
		).toEqual( false );
	} );

	test( 'Should return biz for biz customer type', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'business',
				availablePlans,
			} )
		).toEqual( { type: TYPE_BUSINESS, group: GROUP_WPCOM } );
	} );

	test( 'Should return false when isJetpack is true', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'business',
				isJetpack: true,
			} )
		).toBe( false );
	} );

	test( 'Should return personal for link-in-bio flows', () => {
		expect(
			getPopularPlanSpec( {
				availablePlans,
				flowName: 'link-in-bio',
			} )
		).toEqual( {
			type: TYPE_PERSONAL,
			group: GROUP_WPCOM,
		} );

		expect(
			getPopularPlanSpec( {
				availablePlans,
				flowName: 'link-in-bio-tld',
			} )
		).toEqual( {
			type: TYPE_PERSONAL,
			group: GROUP_WPCOM,
		} );
	} );
} );
