/**
 * Internal dependencies
 */
import shouldNewSiteBePrivateByDefault from '../should-new-site-be-private-by-default';

describe( 'shouldNewSiteBePrivateByDefault()', () => {
	test( 'should be true with no input', () => {
		expect( shouldNewSiteBePrivateByDefault() ).toBe( true );
	} );

	test( 'should return `true` for invalid plan', () => {
		const mockState = { signup: { dependencyStore: { cartItem: 'notARealPlan' } } };
		expect( shouldNewSiteBePrivateByDefault( mockState ) ).toBe( true );
	} );

	test( 'should return `true` for free site', () => {
		const mockState = { signup: { dependencyStore: { cartItem: null } } };
		expect( shouldNewSiteBePrivateByDefault( mockState ) ).toBe( true );
	} );

	test( 'should return `true` for business plan', () => {
		const mockState = {
			signup: {
				dependencyStore: { cartItem: { product_slug: 'business-bundle', free_trial: false } },
			},
		};
		expect( shouldNewSiteBePrivateByDefault( mockState ) ).toBe( true );
	} );

	test( 'should return `false` for ecommerce plan', () => {
		const mockState = {
			signup: {
				dependencyStore: { cartItem: { product_slug: 'ecommerce-bundle', free_trial: false } },
			},
		};
		expect( shouldNewSiteBePrivateByDefault( mockState ) ).toBe( true );
	} );
} );
