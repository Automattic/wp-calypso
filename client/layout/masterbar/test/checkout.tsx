/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import CheckoutMasterbar from '../checkout';
import type { PropsWithChildren } from 'react';

jest.mock( 'calypso/my-sites/checkout/calypso-shopping-cart-provider', () => ( {
	__esModule: true,
	default: ( { children }: PropsWithChildren ) => children,
} ) );
jest.mock( 'calypso/my-sites/checkout/src/components/leave-checkout-modal', () => ( {
	LeaveCheckoutModal: () => null,
	useCheckoutLeaveModal: () => ( { clickClose: jest.fn(), isLeaveDisabled: false } ),
} ) );
jest.mock( 'calypso/my-sites/checkout/src/hooks/use-checkout-help-center', () => ( {
	useCheckoutHelpCenter: () => ( { showHelpIcon: false, toggleHelpCenter: jest.fn() } ),
} ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '../masterbar', () => ( {
	__esModule: true,
	default: ( { children }: PropsWithChildren ) => <header>{ children }</header>,
} ) );

function renderAt( url: string ) {
	window.history.pushState( {}, '', url );
	return render( <CheckoutMasterbar title="Checkout" isLeavingAllowed /> );
}

describe( 'CheckoutMasterbar', () => {
	it( 'links Back to the agency dashboard page the cart came from', () => {
		const cancelTo = 'https://agencies-beta.automattic.com/products?category=jetpack';
		renderAt( `/checkout/agency/purchase?cancel_to=${ encodeURIComponent( cancelTo ) }` );

		expect( screen.getByRole( 'link', { name: 'Back' } ) ).toHaveAttribute( 'href', cancelTo );
	} );

	it( 'shows no Back link when the page to return to is on another host', () => {
		const cancelTo = 'https://example.com/products';
		renderAt( `/checkout/agency/purchase?cancel_to=${ encodeURIComponent( cancelTo ) }` );

		expect( screen.queryByRole( 'link', { name: 'Back' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
	} );

	it( 'shows no Back link on the client referral checkout', () => {
		const cancelTo = 'https://agencies-beta.automattic.com/products';
		renderAt( `/checkout/agency/referral?cancel_to=${ encodeURIComponent( cancelTo ) }` );

		expect( screen.queryByRole( 'link', { name: 'Back' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the leave prompt on the regular checkout', () => {
		renderAt( '/checkout/example.com' );

		expect( screen.getByRole( 'button', { name: 'Back' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Back' } ) ).not.toBeInTheDocument();
	} );

	it.each( [
		[ '/checkout/akismet/ak_plus_yearly_2', '.akismet-logo' ],
		[ '/checkout/jetpack/jetpack_backup_t1_yearly', '.jetpack-logo' ],
		[ '/checkout/passport/passport_yearly', '.passport-logo' ],
	] )( 'shows the brand logo instead of the WordPress logo at %s', ( url, logoSelector ) => {
		const { container } = renderAt( url );

		expect( container.querySelector( logoSelector ) ).toBeVisible();
		expect(
			container.querySelector( '.step-container-v2__top-bar-wordpress-logo-wrapper' )
		).not.toBeInTheDocument();
	} );

	it( 'shows the Akismet logo even when the last selected site is a Jetpack site', () => {
		window.history.pushState( {}, '', '/checkout/akismet/ak_plus_yearly_2' );
		const { container } = render(
			<CheckoutMasterbar title="Checkout" isLeavingAllowed isJetpackNotAtomic />
		);

		expect( container.querySelector( '.akismet-logo' ) ).toBeVisible();
		expect( container.querySelector( '.jetpack-logo' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the WordPress logo on the regular checkout', () => {
		const { container } = renderAt( '/checkout/example.com' );

		expect(
			container.querySelector( '.step-container-v2__top-bar-wordpress-logo-wrapper' )
		).toBeVisible();
	} );
} );
