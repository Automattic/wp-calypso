/**
 * @jest-environment jsdom
 */
import { shouldSkipPlansStep } from '../preselected-plan';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const inCart = ( productSlug: string ) =>
	( { product_slug: productSlug } ) as MinimalRequestCartProduct;

describe( 'shouldSkipPlansStep', () => {
	it( 'skips when the query and the cart name the same plan', () => {
		expect(
			shouldSkipPlansStep(
				new URLSearchParams( 'plan=personal-bundle' ),
				inCart( 'personal-bundle' )
			)
		).toBe( true );
	} );

	// A deep link that never ran the seeding still reaches the grid.
	it( 'does not skip on the query alone', () => {
		expect( shouldSkipPlansStep( new URLSearchParams( 'plan=personal-bundle' ), null ) ).toBe(
			false
		);
	} );

	// The cart is persisted, so on its own it is a leftover from an old session.
	it( 'does not skip on the cart alone', () => {
		expect( shouldSkipPlansStep( new URLSearchParams( '' ), inCart( 'personal-bundle' ) ) ).toBe(
			false
		);
	} );
} );
