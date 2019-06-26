/**
 * Internal dependencies
 */
import { getPopularPlanType } from '..';
import { TYPE_BUSINESS, TYPE_PERSONAL, TYPE_PREMIUM } from '../constants';

describe( 'getPopularPlanType()', () => {
	test( 'Should return TYPE_PERSONAL for personal site type', () => {
		expect( getPopularPlanType( 'blog' ) ).toEqual( TYPE_PERSONAL );
	} );

	test( 'Should return TYPE_PREMIUM for business site type', () => {
		expect( getPopularPlanType( 'professional' ) ).toEqual( TYPE_PREMIUM );
	} );

	test( 'Should return TYPE_BUSINESS for business site type', () => {
		expect( getPopularPlanType( 'business' ) ).toEqual( TYPE_BUSINESS );
	} );
} );
