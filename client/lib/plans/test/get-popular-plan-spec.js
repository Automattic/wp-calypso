/**
 * Internal dependencies
 */
import { getPopularPlanSpec } from '..';
import { GROUP_WPCOM, TYPE_BUSINESS, TYPE_PREMIUM } from '../constants';

const abtest = test => {
	expect( test ).toBe( 'showBusinessPlanPopular' );
	return 'variantShowBizPopular';
};

describe( 'getPopularPlanSpec()', () => {
	test( 'Should return biz for empty customer type', () => {
		expect( getPopularPlanSpec( {} ) ).toEqual( {
			type: TYPE_BUSINESS,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'Should return premium for personal customer type', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'personal',
			} )
		).toEqual( {
			type: TYPE_PREMIUM,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'Should return biz for biz customer type', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'business',
			} )
		).toEqual( { type: TYPE_BUSINESS, group: GROUP_WPCOM } );
	} );

	describe( 'showBusinessPlanPopular A/B test === variantShowBizPopular', () => {
		test( 'Should return biz for personal customer type when in signup flow', () => {
			expect(
				getPopularPlanSpec( {
					customerType: 'personal',
					isInSignup: true,
					isLaunchPage: false,
					abtest,
				} )
			).toEqual( { type: TYPE_BUSINESS, group: GROUP_WPCOM } );
		} );

		test( 'Should return premium for personal customer type when in launch flow', () => {
			expect(
				getPopularPlanSpec( {
					customerType: 'personal',
					isInSignup: true,
					isLaunchPage: true,
					abtest,
				} )
			).toEqual( { type: TYPE_PREMIUM, group: GROUP_WPCOM } );
		} );

		test( 'Should return premium for personal customer type when not in signup flow', () => {
			expect(
				getPopularPlanSpec( {
					customerType: 'personal',
					isInSignup: false,
					abtest,
				} )
			).toEqual( { type: TYPE_PREMIUM, group: GROUP_WPCOM } );
		} );
	} );

	describe( 'showBusinessPlanPopular A/B test === control', () => {
		test( 'Should return premium for personal customer type when in signup flow', () => {
			expect(
				getPopularPlanSpec( {
					customerType: 'personal',
					isInSignup: true,
					isLaunchPage: false,
					abtest: () => 'control',
				} )
			).toEqual( { type: TYPE_PREMIUM, group: GROUP_WPCOM } );
		} );
	} );

	test( 'Should return false when isJetpack is true', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'business',
				isJetpack: true,
			} )
		).toBe( false );
	} );
} );
