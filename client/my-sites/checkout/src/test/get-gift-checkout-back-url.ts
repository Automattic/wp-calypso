import { getGiftCheckoutBackUrl } from '../lib/get-gift-checkout-back-url';

const giftDetails = {
	receiver_blog_id: 123,
	receiver_blog_slug: 'giftedsite.wordpress.com',
	receiver_blog_url: 'giftedsite.wordpress.com',
};

describe( 'getGiftCheckoutBackUrl', () => {
	it( 'returns undefined when the cart has no gift details', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails: undefined,
				referrer: 'https://giftedsite.wordpress.com/',
			} )
		).toBeUndefined();
	} );

	it( 'returns undefined when gift details have no receiver URL', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails: { receiver_blog_id: 123 },
				referrer: 'https://giftedsite.wordpress.com/',
			} )
		).toBeUndefined();
	} );

	it( 'returns the referrer when its host matches the gifted site', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails,
				referrer: 'https://giftedsite.wordpress.com/2026/08/27/hello-world/',
			} )
		).toBe( 'https://giftedsite.wordpress.com/2026/08/27/hello-world/' );
	} );

	it( 'returns the normalized receiver URL when the referrer is on another host', () => {
		expect( getGiftCheckoutBackUrl( { giftDetails, referrer: 'https://evil.example.com/' } ) ).toBe(
			'https://giftedsite.wordpress.com/'
		);
	} );

	it( 'returns the receiver URL when the referrer is on a subdomain of the gifted host', () => {
		expect(
			getGiftCheckoutBackUrl( { giftDetails, referrer: 'https://sub.giftedsite.wordpress.com/' } )
		).toBe( 'https://giftedsite.wordpress.com/' );
	} );

	it( 'returns the receiver URL when there is no referrer', () => {
		expect( getGiftCheckoutBackUrl( { giftDetails, referrer: '' } ) ).toBe(
			'https://giftedsite.wordpress.com/'
		);
	} );

	it( 'returns the receiver URL when the referrer is not http(s)', () => {
		expect( getGiftCheckoutBackUrl( { giftDetails, referrer: 'javascript:alert(1)' } ) ).toBe(
			'https://giftedsite.wordpress.com/'
		);
	} );

	it( 'keeps an existing scheme on the receiver URL', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails: { ...giftDetails, receiver_blog_url: 'http://giftedsite.wordpress.com' },
				referrer: '',
			} )
		).toBe( 'http://giftedsite.wordpress.com/' );
	} );

	it( 'keeps the path of a receiver URL installed in a subdirectory', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails: { ...giftDetails, receiver_blog_url: 'example.com/blog' },
				referrer: '',
			} )
		).toBe( 'https://example.com/blog' );
	} );

	it( 'returns the referrer when it matches the host of a subdirectory receiver URL', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails: { ...giftDetails, receiver_blog_url: 'example.com/blog' },
				referrer: 'https://example.com/some-post/',
			} )
		).toBe( 'https://example.com/some-post/' );
	} );

	it( 'returns undefined when the receiver URL cannot be parsed', () => {
		expect(
			getGiftCheckoutBackUrl( {
				giftDetails: { ...giftDetails, receiver_blog_url: 'not a url' },
				referrer: 'https://giftedsite.wordpress.com/',
			} )
		).toBeUndefined();
	} );
} );
