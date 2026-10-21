import getClientCheckoutRedirectUrl from '../get-client-checkout-redirect-url';

describe( 'getClientCheckoutRedirectUrl', () => {
	it( 'marks a completed client purchase', () => {
		expect( getClientCheckoutRedirectUrl( '/client/subscriptions' ) ).toBe(
			'/client/subscriptions?client_purchase_completed=true'
		);
	} );

	it( 'preserves the WordPress.com hosting product context', () => {
		expect(
			getClientCheckoutRedirectUrl(
				'https://agencies.automattic.com/client/subscriptions',
				'wpcom-business'
			)
		).toBe(
			'https://agencies.automattic.com/client/subscriptions?client_purchase_completed=true&wpcom_plan_purchased=wpcom-business'
		);
	} );
} );
