/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import SocialSignupForm from 'calypso/blocks/signup-form/social';
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
	handleResponse: jest.fn(),
	setCurrentStep: jest.fn(),
};

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { login: loginReducer, route: routeReducer } } );

describe( 'SocialSignupForm', () => {
	test( 'renders Google social signup button', () => {
		render( <SocialSignupForm { ...defaultProps } /> );

		expect( screen.getByText( /Continue with Google/i ) ).toBeInTheDocument();
	} );

	test( 'filters social buttons based on allowedSocialServices', () => {
		render( <SocialSignupForm { ...defaultProps } allowedSocialServices={ [ 'paypal' ] } /> );

		expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
		expect( screen.queryByText( /Continue with Google/i ) ).not.toBeInTheDocument();
	} );

	test( 'shows only specified social buttons from allowedSocialServices', () => {
		render(
			<SocialSignupForm { ...defaultProps } allowedSocialServices={ [ 'paypal', 'google' ] } />
		);

		expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Continue with Google/i ) ).toBeInTheDocument();
	} );

	test( 'adds email button at the end when isSocialFirst and email is not in allowedSocialServices', () => {
		render(
			<SocialSignupForm
				{ ...defaultProps }
				isSocialFirst
				allowedSocialServices={ [ 'paypal', 'google' ] }
			/>
		);

		expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Continue with Google/i ) ).toBeInTheDocument();
		// Email button should be added at the end
		expect( screen.getByText( /Continue with email/i ) ).toBeInTheDocument();
	} );

	test( 'does not duplicate email button when email is already in allowedSocialServices', () => {
		render(
			<SocialSignupForm
				{ ...defaultProps }
				isSocialFirst
				allowedSocialServices={ [ 'paypal', 'email' ] }
			/>
		);

		const emailButtons = screen.getAllByText( /Continue with email/i );
		expect( emailButtons ).toHaveLength( 1 );
	} );

	test( 'does not show email button when not in isSocialFirst mode', () => {
		render(
			<SocialSignupForm
				{ ...defaultProps }
				isSocialFirst={ false }
				allowedSocialServices={ [ 'paypal', 'google' ] }
			/>
		);

		expect( screen.getByText( /Continue with PayPal/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Continue with Google/i ) ).toBeInTheDocument();
		expect( screen.queryByText( /Continue with email/i ) ).not.toBeInTheDocument();
	} );
} );
