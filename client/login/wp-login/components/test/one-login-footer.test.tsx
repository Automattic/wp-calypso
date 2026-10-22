/**
 * Run with:
 * yarn test-client client/login/wp-login/components/test/one-login-footer.test.tsx
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import oauth2ClientsReducer from 'calypso/state/oauth2-clients/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import OneLoginFooter from '../one-login-footer';

const lostPasswordLink = <a href="/lost">Lost your password?</a>;

const renderFooter = ( props: Partial< React.ComponentProps< typeof OneLoginFooter > > = {} ) =>
	renderWithProvider(
		<OneLoginFooter isLoginView lostPasswordLink={ lostPasswordLink } { ...props } />,
		{
			reducers: { oauth2Clients: oauth2ClientsReducer },
		}
	);

describe( 'OneLoginFooter', () => {
	test( 'renders the route to signup when showSignupPrompt is set', () => {
		renderFooter( { showSignupPrompt: true } );
		expect( screen.getByRole( 'link', { name: 'Sign up' } ) ).toBeVisible();
	} );

	test( 'omits the route to signup when showSignupPrompt is unset', () => {
		renderFooter();
		expect( screen.queryByRole( 'link', { name: 'Sign up' } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the lost-password link at every width unless the form carries its own', () => {
		renderFooter();
		expect(
			screen.getByRole( 'link', { name: 'Lost your password?' } ).parentElement
		).not.toHaveClass( 'one-login__footer-mobile' );
	} );

	test( 'hides the lost-password link on desktop when the form carries its own', () => {
		renderFooter( { lostPasswordLinkMobileOnly: true } );
		expect( screen.getByRole( 'link', { name: 'Lost your password?' } ).parentElement ).toHaveClass(
			'one-login__footer-mobile'
		);
	} );
} );
