/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import EmailValidationBanner from '../email-validation-banner';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { Provider as ReduxProvider } from 'react-redux';

// clicking resend email resends email

// does not show the notice if already verified'

// 'shows the notice if not verified

// 'fires success notice action when resend is successful

// fires error notice action when resend is unsuccessful

// clicking close closes the banner

// x banner display user's email
// x clicking change email redirects

const props = {
	email: 'testemail@wordpress.com',
	closeBanner: () => {},
};

function renderEmailValidationBanner() {
	const store = createReduxStore();

	render(
		<ReduxProvider store={ store }>
			<EmailValidationBanner { ...props } />
		</ReduxProvider>
	);
}

describe( 'EmailValidationBanner', () => {
	it( "displays the user's email", () => {
		renderEmailValidationBanner();

		const emailValidationBanner = screen.getByText(
			/Make sure to validate the email we sent to testemail@wordpress.com in order to publish and share your posts./i
		);

		expect( emailValidationBanner ).toBeInTheDocument();
	} );

	it( 'change email link redirects to /me/account', () => {
		renderEmailValidationBanner();

		expect( screen.getByRole( 'link', { name: 'change email address' } ) ).toHaveAttribute(
			'href',
			'/me/account'
		);
	} );
} );
