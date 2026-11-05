/** @jest-environment jsdom */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useHeadingLogo } from 'calypso/login/wp-login/components/heading-logo';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import EmailedLoginLinkSuccessfully from '../emailed-login-link-successfully';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( 'calypso/components/redirect-when-logged-in', () => () => null );
jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordPageViewWithClientId: () => ( { type: 'TEST_PAGE_VIEW' } ),
	enhanceWithSiteType: ( action ) => action,
} ) );
jest.mock( 'calypso/login/wp-login/components/heading-logo', () => ( {
	useHeadingLogo: jest.fn(),
} ) );

const renderScreen = ( emailAddress = 'person@gmail.com' ) =>
	renderWithProvider( <EmailedLoginLinkSuccessfully emailAddress={ emailAddress } /> );

describe( 'EmailedLoginLinkSuccessfully', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		useHeadingLogo.mockReturnValue( null );
	} );

	it( 'shows the inbox button and help text in the account template layout', () => {
		const { container } = renderScreen();

		expect( screen.getByRole( 'link', { name: 'Open in Gmail' } ) ).toBeVisible();
		expect( container.querySelector( '.magic-login__check-email-help' ) ).toBeVisible();
		expect( container.querySelector( '.one-login__footer' ) ).not.toBeInTheDocument();
	} );

	it( 'shows only the help text for an unknown email provider', () => {
		renderScreen( 'person@example.com' );

		expect( screen.queryByRole( 'link', { name: /Open in/ } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'or reset your password.' } ) ).toBeVisible();
	} );

	it( 'keeps the centered layout for product logins with a logo above the title', () => {
		useHeadingLogo.mockReturnValue( <img alt="Product" /> );
		const { container } = renderScreen();

		expect( container.querySelector( '.magic-login__emails-list' ) ).toBeVisible();
		expect( container.querySelector( '.one-login__footer-text' ) ).toBeVisible();
		expect(
			container.querySelector( '.magic-login__check-email-actions' )
		).not.toBeInTheDocument();
	} );

	it( 'checks for a heading logo with the connection flow plugins', () => {
		renderWithProvider( <EmailedLoginLinkSuccessfully emailAddress="person@gmail.com" />, {
			initialPath: '/log-in/link?from=jetpack-connector&plugins=woocommerce',
		} );

		expect( useHeadingLogo ).toHaveBeenCalledWith( {
			isUnifiedConnectionFlow: true,
			connectorPlugins: expect.arrayContaining( [ 'woocommerce' ] ),
		} );
	} );

	it( 'goes to lost password from the help text', async () => {
		renderScreen();

		await userEvent.click( screen.getByRole( 'link', { name: 'or reset your password.' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_login_lost_password_click', {
			from: 'magic-login',
		} );
		expect( page ).toHaveBeenCalledWith( expect.stringContaining( 'lostpassword' ) );
	} );
} );
