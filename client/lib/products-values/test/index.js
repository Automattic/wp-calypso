/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isJetpackPlan } from '..';
import {
	JETPACK_PLANS,
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from 'client/lib/plans/constants';

/**
 * Test helper to build a product object
 *
 * @param  {String} product_slug Product slug
 * @return {Object}              Object containing product_slug
 */
const makeProductFromSlug = product_slug => ( { product_slug } );

describe( 'isJetpackPlan', () => {
	test( 'should return true for Jetpack products', () => {
		JETPACK_PLANS.map( makeProductFromSlug ).forEach(
			product => expect( isJetpackPlan( product ) ).to.be.true
		);
	} );

	test( 'should return false for non-Jetpack products', () => {
		const nonJetpackPlans = [ PLAN_BUSINESS, PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ];

		nonJetpackPlans
			.map( makeProductFromSlug )
			.forEach( product => expect( isJetpackPlan( product ) ).to.be.false );
	} );
} );
