import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { getLabel } from '../src';

const studioCredits = {
	...getEmptyResponseCartProduct(),
	product_slug: 'studio-code-ai-credits',
	product_name: 'Studio Code AI Credits',
};

describe( 'getLabel', () => {
	describe( 'Studio Code AI Credits', () => {
		it( 'includes the credit quantity', () => {
			expect( getLabel( { ...studioCredits, quantity: 500 } ) ).toBe(
				'Studio Code AI Credits (500 credits)'
			);
		} );

		it( 'uses the singular form for one credit', () => {
			expect( getLabel( { ...studioCredits, quantity: 1 } ) ).toBe(
				'Studio Code AI Credits (1 credit)'
			);
		} );

		it( 'uses a separator for thousands of credits', () => {
			expect( getLabel( { ...studioCredits, quantity: 1000 } ) ).toBe(
				'Studio Code AI Credits (1,000 credits)'
			);
		} );

		it( 'shows zero credits when the cart has no quantity', () => {
			expect( getLabel( { ...studioCredits, quantity: null } ) ).toBe(
				'Studio Code AI Credits (0 credits)'
			);
		} );
	} );

	describe( 'other products', () => {
		it( 'returns the product name for a plan', () => {
			const plan = {
				...getEmptyResponseCartProduct(),
				product_slug: 'business-bundle',
				product_name: 'WordPress.com Business',
			};
			expect( getLabel( plan ) ).toBe( 'WordPress.com Business' );
		} );

		it( 'keeps the Akismet Pro 500 request count', () => {
			const akismetPro500 = {
				...getEmptyResponseCartProduct(),
				product_slug: 'ak_pro5h_yearly',
				product_name: 'Akismet Pro',
				quantity: 2,
			};
			expect( getLabel( akismetPro500 ) ).toBe( 'Akismet Pro (1000 requests/month)' );
		} );

		it( 'returns the domain name for a domain registration', () => {
			const domain = {
				...getEmptyResponseCartProduct(),
				product_slug: 'domain_reg',
				product_name: 'Domain Registration',
				meta: 'example.com',
				is_domain_registration: true,
			};
			expect( getLabel( domain ) ).toBe( 'example.com' );
		} );
	} );
} );
