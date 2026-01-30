/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import SocialLoginForm from 'calypso/blocks/login/social';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( ( key ) => {
		if ( key === 'wpcom_signup_id' ) {
			return 'test-id';
		}
		if ( key === 'wpcom_signup_key' ) {
			return 'test-key';
		}
		return null;
	} );
	config.isEnabled = jest.fn( ( feature ) => {
		if ( feature === 'sign-in-with-paypal' ) {
			return true;
		}
		return false;
	} );
	return config;
} );

const defaultProps = {
	handleLogin: jest.fn(),
	trackLoginAndRememberRedirect: jest.fn(),
	resetLastUsedAuthenticationMethod: jest.fn(),
};

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { login: loginReducer, route: routeReducer } } );

describe( 'SocialLoginForm', () => {
	test( 'renders Google social login button', () => {
		render( <SocialLoginForm { ...defaultProps } /> );

		expect( screen.getByText( /Continue with Google/i ) ).toBeInTheDocument();
	} );

	test( 'filters social buttons based on allowedSocialServices', () => {
		render( <SocialLoginForm { ...defaultProps } allowedSocialServices={ [ 'paypal' ] } /> );

		expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
		expect( screen.queryByText( /Continue with Google/i ) ).not.toBeInTheDocument();
	} );

	test( 'replaces last used social button with UsernameOrEmailButton in social-first mode', () => {
		render(
			<SocialLoginForm { ...defaultProps } isSocialFirst lastUsedAuthenticationMethod="google" />
		);

		// Google button should be replaced with "Continue with email"
		expect( screen.getByText( /Continue with email/i ) ).toBeInTheDocument();
		// Google button itself should not be present since it's replaced
		expect( screen.queryByText( /Continue with Google/i ) ).not.toBeInTheDocument();
	} );

	test( 'renders UsernameOrEmailButton when lastUsedAuthenticationMethod is not in allowedSocialServices', () => {
		render(
			<SocialLoginForm
				{ ...defaultProps }
				isSocialFirst
				lastUsedAuthenticationMethod="google"
				allowedSocialServices={ [ 'paypal' ] }
			/>
		);

		// PayPal should be rendered (it's in the allowed list)
		expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
		// Google is NOT in the allowed list, but since it's the lastUsedAuthenticationMethod,
		// UsernameOrEmailButton should still be appended
		expect( screen.getByText( /Continue with email/i ) ).toBeInTheDocument();
		// Google button itself should not be present
		expect( screen.queryByText( /Continue with Google/i ) ).not.toBeInTheDocument();
	} );

	test( 'does not render UsernameOrEmailButton when not in social-first mode even with lastUsedAuthenticationMethod', () => {
		render(
			<SocialLoginForm
				{ ...defaultProps }
				isSocialFirst={ false }
				lastUsedAuthenticationMethod="google"
				allowedSocialServices={ [ 'paypal' ] }
			/>
		);

		// Only PayPal should be rendered
		expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
		// UsernameOrEmailButton should NOT be present (not social-first mode)
		expect( screen.queryByText( /Continue with email/i ) ).not.toBeInTheDocument();
	} );

	test( 'does not duplicate UsernameOrEmailButton when lastUsedAuthenticationMethod is in allowedSocialServices', () => {
		render(
			<SocialLoginForm
				{ ...defaultProps }
				isSocialFirst
				lastUsedAuthenticationMethod="paypal"
				allowedSocialServices={ [ 'paypal', 'google' ] }
			/>
		);

		// PayPal is in the allowed list AND is the lastUsedAuthenticationMethod,
		// so it should be replaced by UsernameOrEmailButton (only one)
		const emailButtons = screen.getAllByText( /Continue with email/i );
		expect( emailButtons ).toHaveLength( 1 );
		// Google should still be present
		expect( screen.getByText( /Continue with Google/i ) ).toBeInTheDocument();
	} );
} );
