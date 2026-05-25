/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LoginContext } from 'calypso/login/login-context';
import { RequestLoginEmailForm } from '../request-login-email-form';

describe( 'RequestLoginEmailForm connect-screen usage', () => {
	const baseProps = {
		sendEmailLogin: jest.fn(),
		hideMagicLoginRequestNotice: jest.fn(),
		translate: ( text ) => text,
		isGravPoweredClient: false,
		showCheckYourEmail: false,
		isFetching: false,
		emailRequested: false,
		requestError: null,
		isSubmitButtonDisabled: false,
		isSubmitButtonBusy: false,
	};

	const renderForm = ( props = {} ) => {
		return render(
			<LoginContext.Provider value={ { setHeaders: jest.fn() } }>
				<RequestLoginEmailForm { ...baseProps } { ...props } />
			</LoginContext.Provider>
		);
	};

	it( 'renders ConsentText when a ToS component is provided', () => {
		const { container } = renderForm( { tosComponent: <span>Custom ToS</span> } );

		expect( container.querySelector( '.connect-screen-consent-text' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Custom ToS' ) ).toBeInTheDocument();
	} );

	it( 'does not render ConsentText when no ToS component is provided', () => {
		const { container } = renderForm();

		expect( container.querySelector( '.connect-screen-consent-text' ) ).not.toBeInTheDocument();
	} );

	it( 'disables the primary action when the input is empty', () => {
		renderForm( { userEmail: '' } );

		expect( screen.getByRole( 'button', { name: 'Send link' } ) ).toBeDisabled();
	} );

	it( 'enables submit action when input has a value', () => {
		renderForm( { userEmail: 'person@example.com' } );

		const submitButton = screen.getByRole( 'button', { name: 'Send link' } );
		expect( submitButton ).toBeEnabled();
		expect( submitButton ).toHaveAttribute( 'type', 'submit' );
	} );

	it( 'shows busy state on the primary action when submitting', () => {
		renderForm( { userEmail: 'person@example.com', isSubmitButtonBusy: true } );

		expect( screen.getByRole( 'button' ) ).toBeDisabled();
	} );
} );
