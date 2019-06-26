/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPopularPlanSpec } from '..';
import { TYPE_BUSINESS } from '../constants';

describe( 'getPopularPlanSpec()', () => {
	test( 'Should return biz for biz customer type', () => {
		expect(
			getPopularPlanSpec( {
				customerType: 'business',
			} )
		).to.deep.equal( { type: TYPE_BUSINESS, group: 'GROUP_WPCOM' } );
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
