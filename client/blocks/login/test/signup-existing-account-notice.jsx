/**
 * @jest-environment jsdom
 */
import SignupExistingAccountNotice from 'calypso/blocks/login/signup-existing-account-notice';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const renderAtPath = ( initialPath ) =>
	renderWithProvider( <SignupExistingAccountNotice />, { initialPath } );

describe( 'SignupExistingAccountNotice', () => {
	test( 'names the address signup redirected with', () => {
		const { container } = renderAtPath(
			'/log-in?is_signup_existing_account=true&email_address=user@example.com'
		);

		expect( container ).toHaveTextContent( 'account with the email user@example.com' );
	} );

	test( 'shows nothing on an ordinary login', () => {
		const { container } = renderAtPath( '/log-in' );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
