import { hasCopySitePlan } from '../has-copy-site-plan';
import type { ResponseCart } from '@automattic/shopping-cart';

test( 'requires the intended plan to retain the Copy Site tag', () => {
	const cart = {
		products: [
			{ product_slug: 'business-bundle', extra: {} },
			{ product_slug: 'business-bundle-monthly', extra: { signup_flow: 'copy-site' } },
		],
	} as ResponseCart;

	expect( hasCopySitePlan( cart, 'business-bundle-monthly' ) ).toBe( true );
	expect( hasCopySitePlan( cart, 'business-bundle' ) ).toBe( false );
	expect( hasCopySitePlan( undefined, 'business-bundle-monthly' ) ).toBe( false );
} );
