/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPopularPlanType } from '..';
import { TYPE_BUSINESS, TYPE_PERSONAL, TYPE_PREMIUM } from '../constants';

describe( 'getPopularPlanType()', () => {
	test( 'Should return TYPE_PERSONAL for personal site type', () => {
		expect( getPopularPlanType( 'blog' ) ).to.equal( TYPE_PERSONAL );
	} );

	test( 'Should return TYPE_PREMIUM for business site type', () => {
		expect( getPopularPlanType( 'professional' ) ).to.equal( TYPE_PREMIUM );
	} );

	test( 'Should return TYPE_BUSINESS for business site type', () => {
		expect( getPopularPlanType( 'business' ) ).to.equal( TYPE_BUSINESS );
	} );
} );
