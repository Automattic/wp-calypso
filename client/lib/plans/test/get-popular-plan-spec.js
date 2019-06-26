/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { getPopularPlanSpec } from '..';
import { GROUP_WPCOM, TYPE_BUSINESS, TYPE_PERSONAL, TYPE_PREMIUM } from '../constants';

const abtest = noop;

describe( 'getPopularPlanSpec()', () => {
	test( 'Should return biz for empty customer type', () => {
		expect( getPopularPlanSpec( {} ) ).to.deep.equal( {
			type: TYPE_BUSINESS,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'Should return premium for personal customer type', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'personal',
			} )
		).to.deep.equal( {
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
		).to.deep.equal( {
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
		).to.deep.equal( {
			type: TYPE_PREMIUM,
			group: GROUP_WPCOM,
		} );
	} );

	test( 'Should return biz for biz customer type', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'business',
			} )
		).to.deep.equal( { type: TYPE_BUSINESS, group: GROUP_WPCOM } );
	} );

	test( 'Should return false when isJetpack is true', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'business',
				isJetpack: true,
			} )
		).to.be.false;
	} );
} );
