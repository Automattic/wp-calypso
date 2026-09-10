/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import SignupExistingAccountNotice from 'calypso/blocks/login/signup-existing-account-notice';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const renderAtPath = ( initialPath ) =>
	renderWithProvider( <SignupExistingAccountNotice signupUrl="/start" />, { initialPath } );

describe( 'SignupExistingAccountNotice', () => {
	test( 'names the address signup redirected with', () => {
		renderAtPath( '/log-in?is_signup_existing_account=true&email_address=user@example.com' );

		expect( screen.getByText( /account with the email user@example.com/ ) ).toBeVisible();
	} );

	test( 'stays generic when the redirect carried no address', () => {
		renderAtPath( '/log-in?is_signup_existing_account=true' );

		expect( screen.getByText( /account with that email address/ ) ).toBeVisible();
	} );

	test( 'shows nothing on an ordinary login', () => {
		const { container } = renderAtPath( '/log-in' );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
