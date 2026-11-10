/**
 * @jest-environment jsdom
 */

import CancelHeaderTitle from '../cancel-header-title';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 123,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		is_plan: true,
		is_domain_registration: false,
		is_auto_renew_enabled: true,
		...overrides,
	} as Purchase;
}

// CancelHeaderTitle returns a string rather than an element, so call it directly.
function titleFor( props: Partial< Parameters< typeof CancelHeaderTitle >[ 0 ] > ) {
	return CancelHeaderTitle( {
		displayVariant: 'cancel',
		intent: null,
		purchase: makePurchase(),
		...props,
	} as Parameters< typeof CancelHeaderTitle >[ 0 ] );
}

describe( 'CancelHeaderTitle', () => {
	describe( 'once the survey is showing', () => {
		test( 'reports the cancellation as confirmed for the cancel intent', () => {
			expect( titleFor( { intent: 'cancel', displayVariant: 'cancel', surveyShown: true } ) ).toBe(
				'Cancellation confirmed'
			);
		} );

		test( 'reports auto-renew as disabled for the auto-renew intent', () => {
			expect(
				titleFor( { intent: 'auto-renew', displayVariant: 'auto-renew', surveyShown: true } )
			).toBe( 'Auto-renew disabled' );
		} );

		// The no-intent deep link still submits at survey-end, so nothing has
		// happened yet. displayVariant falls back to 'cancel' here, which is
		// exactly the trap this guards against.
		test( 'does not claim a cancellation happened with no intent', () => {
			const title = titleFor( { intent: null, displayVariant: 'cancel', surveyShown: true } );
			expect( title ).not.toBe( 'Cancellation confirmed' );
			expect( title ).not.toBe( 'Auto-renew disabled' );
		} );

		// Remove defers its mutation to survey-end too.
		test( 'does not claim a cancellation happened for the remove intent', () => {
			const title = titleFor( { intent: 'remove', displayVariant: 'remove', surveyShown: true } );
			expect( title ).not.toBe( 'Cancellation confirmed' );
			expect( title ).not.toBe( 'Auto-renew disabled' );
		} );
	} );

	test( 'shows the pre-cancellation heading before the survey is reached', () => {
		const title = titleFor( { intent: 'cancel', displayVariant: 'cancel', surveyShown: false } );
		expect( title ).not.toBe( 'Cancellation confirmed' );
	} );
} );
