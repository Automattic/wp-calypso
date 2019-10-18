/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { getPopularPlanSpec } from '..';
import { GROUP_WPCOM, TYPE_BUSINESS, TYPE_PERSONAL, TYPE_PREMIUM } from '../constants';

const abtest = noop;

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

	test( 'Should return personal for blog site type', () => {
		expect(
			getPopularPlanSpec( {
				siteType: 'blog',
				abtest,
			} )
		).toEqual( {
			type: TYPE_PERSONAL,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'Should return premium for professional site type', () => {
		expect(
			getPopularPlanSpec( {
				siteType: 'professional',
				abtest,
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

	test( 'Should return false when isJetpack is true', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'business',
				isJetpack: true,
			} )
		).toBe( false );
	} );
} );
