/**
 * Internal dependencies
 */
import getNewSitePublicSetting from '../get-new-site-public-setting';

describe( 'getNewSitePublicSetting()', () => {
	test( 'should return `-1` by default', () => {
		expect( getNewSitePublicSetting() ).toBe( -1 );
	} );

	test( 'should return `-1` for invalid plan', () => {
		const mockState = { signup: { dependencyStore: { cartItem: 'notARealPlan' } } };
		expect( getNewSitePublicSetting( mockState ) ).toBe( -1 );
	} );

	test( 'should return `-1` for free site', () => {
		const mockState = { signup: { dependencyStore: { cartItem: null } } };
		expect( getNewSitePublicSetting( mockState ) ).toBe( -1 );
	} );

	test( 'should return `-1` for business plan', () => {
		const mockState = {
			signup: {
				dependencyStore: { cartItem: { product_slug: 'business-bundle', free_trial: false } },
			},
		};
		expect( getNewSitePublicSetting( mockState ) ).toBe( -1 );
	} );

	test( 'should return `1` for ecommerce plan', () => {
		const mockState = {
			signup: {
				dependencyStore: { cartItem: { product_slug: 'ecommerce-bundle', free_trial: false } },
			},
		};
		expect( getNewSitePublicSetting( mockState ) ).toBe( 1 );
	} );
} );
