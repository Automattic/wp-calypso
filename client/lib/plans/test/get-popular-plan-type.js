/**
 * Internal dependencies
 */
import { getPopularPlanType } from '..';
import { TYPE_BUSINESS, TYPE_PERSONAL, TYPE_PREMIUM } from '../constants';

describe( 'getPopularPlanType()', () => {
	test( 'Should return TYPE_PERSONAL for personal site type', () => {
		expect( getPopularPlanType( 'blog' ) ).toBe( TYPE_PERSONAL );
	} );

	test( 'Should return TYPE_PREMIUM for business site type', () => {
		expect( getPopularPlanType( 'professional' ) ).toBe( TYPE_PREMIUM );
	} );

	test( 'Should return TYPE_BUSINESS for business site type', () => {
		expect( getPopularPlanType( 'business' ) ).toBe( TYPE_BUSINESS );
	} );
} );
