/**
 * @jest-environment jsdom
 */
import { PLAN_ECOMMERCE_2_YEARS, PLAN_HOSTING_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
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

	it( 'skips a plan outside the preselectable list only in new-hosted-site', () => {
		const query = new URLSearchParams( { plan: PLAN_ECOMMERCE_2_YEARS } );
		const cart = inCart( PLAN_ECOMMERCE_2_YEARS );
		expect( shouldSkipPlansStep( query, cart ) ).toBe( false );
		expect( shouldSkipPlansStep( query, cart, NEW_HOSTED_SITE_FLOW ) ).toBe( true );
	} );

	it( 'does not skip an invalid or trial plan in new-hosted-site', () => {
		expect(
			shouldSkipPlansStep(
				new URLSearchParams( 'plan=not-a-plan' ),
				inCart( 'not-a-plan' ),
				NEW_HOSTED_SITE_FLOW
			)
		).toBe( false );
		expect(
			shouldSkipPlansStep(
				new URLSearchParams( { plan: PLAN_HOSTING_TRIAL_MONTHLY } ),
				inCart( PLAN_HOSTING_TRIAL_MONTHLY ),
				NEW_HOSTED_SITE_FLOW
			)
		).toBe( false );
	} );
} );
