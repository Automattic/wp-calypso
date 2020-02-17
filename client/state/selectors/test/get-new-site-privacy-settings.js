/**
 * Internal dependencies
 */
import getNewSitePrivacySettings from '../get-new-site-privacy-settings';

describe( 'getNewSitePrivacySettings()', () => {
	describe( '`public` option', () => {
		test( 'should return `-1` by default', () => {
			expect( getNewSitePrivacySettings() ).toEqual( { public: -1 } );
		} );

		test( 'should return `-1` for invalid plan', () => {
			const mockState = { signup: { dependencyStore: { cartItem: 'notARealPlan' } } };
			expect( getNewSitePrivacySettings( mockState ) ).toEqual( { public: -1 } );
		} );

		test( 'should return `-1` for free site', () => {
			const mockState = { signup: { dependencyStore: { cartItem: null } } };
			expect( getNewSitePrivacySettings( mockState ) ).toEqual( { public: -1 } );
		} );

		test( 'should return `-1` for business plan', () => {
			const mockState = {
				signup: {
					dependencyStore: { cartItem: { product_slug: 'business-bundle', free_trial: false } },
				},
			};
			expect( getNewSitePrivacySettings( mockState ) ).toEqual( { public: -1 } );
		} );

		test( 'should return `1` for ecommerce plan', () => {
			const mockState = {
				signup: {
					dependencyStore: { cartItem: { product_slug: 'ecommerce-bundle', free_trial: false } },
				},
			};
			expect( getNewSitePrivacySettings( mockState ) ).toEqual( { public: 1 } );
		} );
	} );
} );
