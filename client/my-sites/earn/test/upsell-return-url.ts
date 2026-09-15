/**
 * @jest-environment jsdom
 */

import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getUpsellCheckoutQueryArgs, getUpsellReturnUrl } from '../upsell-return-url';

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud', () => jest.fn() );

const mockedIsJetpackCloud = isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud >;

describe( 'getUpsellReturnUrl', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		window.history.pushState( {}, '', '/earn/payments/example.wordpress.com' );
	} );

	it( 'returns the current page as a relative URL', () => {
		window.history.pushState(
			{},
			'',
			'/earn/payments/example.wordpress.com?foo=bar#add-tier-plan'
		);

		expect( getUpsellReturnUrl() ).toBe(
			'/earn/payments/example.wordpress.com?foo=bar#add-tier-plan'
		);
	} );

	// Jetpack Cloud checkout runs on WordPress.com, where a relative path would
	// resolve to a page that does not exist.
	it( 'returns an absolute URL in Jetpack Cloud', () => {
		mockedIsJetpackCloud.mockReturnValue( true );

		expect( getUpsellReturnUrl() ).toBe(
			'https://example.com/earn/payments/example.wordpress.com'
		);
	} );

	it( 'pairs the return URL with a cancel destination for checkout links', () => {
		expect( getUpsellCheckoutQueryArgs() ).toEqual( {
			redirect_to: '/earn/payments/example.wordpress.com',
			cancel_to: '/earn/payments/example.wordpress.com',
		} );
	} );

	// `leaveCheckout` ignores an absolute `cancel_to`, so sending one would only
	// look like the cancel destination was honoured.
	it( 'omits the cancel destination in Jetpack Cloud', () => {
		mockedIsJetpackCloud.mockReturnValue( true );

		expect( getUpsellCheckoutQueryArgs() ).toEqual( {
			redirect_to: 'https://example.com/earn/payments/example.wordpress.com',
		} );
	} );
} );
