import { isReferralCheckoutUrl } from '../referral-checkout-url';

describe( 'isReferralCheckoutUrl', () => {
	it( 'accepts the checkout links the referral is created with', () => {
		expect(
			isReferralCheckoutUrl(
				'https://wordpress.com/checkout/agency/referral?agency_id=1&referral_id=2&secret=abc'
			)
		).toBe( true );
		expect(
			isReferralCheckoutUrl(
				'https://agencies.automattic.com/client/checkout?agency_id=1&referral_id=2&secret=abc'
			)
		).toBe( true );
	} );

	it( 'rejects other hosts, other pages and other protocols', () => {
		expect( isReferralCheckoutUrl( 'https://example.com/checkout/agency/referral' ) ).toBe( false );
		expect( isReferralCheckoutUrl( 'https://wordpress.com.example.com/checkout/' ) ).toBe( false );
		expect( isReferralCheckoutUrl( 'https://wordpress.com/log-in' ) ).toBe( false );
		expect( isReferralCheckoutUrl( 'http://wordpress.com/checkout/agency/referral' ) ).toBe(
			false
		);
		// eslint-disable-next-line no-script-url
		expect( isReferralCheckoutUrl( 'javascript:alert(1)' ) ).toBe( false );
		expect( isReferralCheckoutUrl( '/checkout/agency/referral' ) ).toBe( false );
	} );
} );
