/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import NewReferralNotice from '../new-referral-notice';

const mockUseSearch = jest.fn();
const mockNavigate = jest.fn();

jest.mock( '../../../../app/router/agency', () => ( {
	earnReferralsRoute: { useSearch: () => mockUseSearch() },
} ) );

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => mockNavigate,
} ) );

const CHECKOUT_URL = 'https://wordpress.com/checkout/agency/referral?referral_blog_id=1';

describe( 'NewReferralNotice', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'confirms a sent referral with the client’s email', async () => {
		mockUseSearch.mockReturnValue( {
			new_referral_order_email: 'client@example.com',
			new_referral_order_checkout_url: CHECKOUT_URL,
			flow_type: 'send',
		} );
		render( <NewReferralNotice /> );

		expect( await screen.findByText( 'Referral sent to client@example.com' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Copy link' } ) ).toBeVisible();
	} );

	it( 'confirms a copied link', async () => {
		mockUseSearch.mockReturnValue( {
			new_referral_order_email: 'client@example.com',
			new_referral_order_checkout_url: CHECKOUT_URL,
			flow_type: 'copy',
		} );
		render( <NewReferralNotice /> );

		expect(
			await screen.findByText( 'The referral link has been copied to your clipboard!' )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Copy link again' } ) ).toBeVisible();
	} );

	it( 'confirms a sent referral without the copy button when the link is missing', async () => {
		mockUseSearch.mockReturnValue( {
			new_referral_order_email: 'client@example.com',
			flow_type: 'send',
		} );
		render( <NewReferralNotice /> );

		expect( await screen.findByText( 'Referral sent to client@example.com' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /Copy link/ } ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the copied title without the copy button when the link is missing', async () => {
		mockUseSearch.mockReturnValue( {
			new_referral_order_email: 'client@example.com',
			flow_type: 'copy',
		} );
		render( <NewReferralNotice /> );

		expect(
			await screen.findByText( 'The referral link has been copied to your clipboard!' )
		).toBeVisible();
		expect( screen.queryByText( /Referral sent/ ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Copy link/ } ) ).not.toBeInTheDocument();
	} );

	it( 'shows nothing without the client’s email', () => {
		mockUseSearch.mockReturnValue( { new_referral_order_checkout_url: CHECKOUT_URL } );
		render( <NewReferralNotice /> );

		expect( screen.queryByText( /Referral sent/ ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Copy link/ } ) ).not.toBeInTheDocument();
	} );

	it( 'clears the request from the URL on Dismiss', async () => {
		mockUseSearch.mockReturnValue( {
			new_referral_order_email: 'client@example.com',
			new_referral_order_checkout_url: CHECKOUT_URL,
			flow_type: 'send',
		} );
		render( <NewReferralNotice /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Dismiss' } ) );

		expect( mockNavigate ).toHaveBeenCalledWith( { to: '/referrals', search: {}, replace: true } );
	} );
} );
