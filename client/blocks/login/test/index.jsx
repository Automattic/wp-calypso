/**
 * @jest-environment jsdom
 */
import LoginBlock from 'calypso/blocks/login';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

// `socialConnect` short-circuits the form, so this exercises placement only.
const renderGravPowered = () =>
	renderWithProvider( <LoginBlock isGravPoweredClient socialConnect onSuccess={ () => {} } />, {
		initialPath: '/log-in?is_signup_existing_account=true&email_address=grav@example.com',
		reducers: { login: loginReducer },
	} );

describe( 'LoginBlock', () => {
	test( 'keeps the existing-account notice on Grav-powered logins, which render no shared layout', () => {
		const { container } = renderGravPowered();

		expect( container ).toHaveTextContent( 'grav@example.com' );
	} );
} );
