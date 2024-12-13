/**
 * @jest-environment jsdom
 */
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LostPasswordForm from 'calypso/blocks/login/lost-password-form';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
} ) );

describe( 'LostPasswordForm', () => {
	test( 'displays a lost password form without errors', () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		const email = screen.getByLabelText( /Your email/i );
		expect( email ).toBeInTheDocument();

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		expect( btn ).toBeInTheDocument();
		expect( btn ).toBeDisabled();

		expect( screen.queryByRole( 'alert' ) ).toBeNull();
	} );

	test( 'displays an error message when email is invalid', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type( screen.getByRole( 'textbox', { name: 'Your email' } ), 'invalid email' );
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await waitFor( () => {
			expect( screen.getByRole( 'alert' ) ).toBeInTheDocument();
		} );

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		expect( btn ).toBeDisabled();
	} );

	test( 'enable submit button when email is valid', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Your email' } ),
			'user@example.com'
		);
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		expect( btn ).toBeEnabled();
	} );

	test( 'reset error message when email is valid', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type( screen.getByRole( 'textbox', { name: 'Your email' } ), 'invalid email' );
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Your email' } ),
			'user@example.com'
		);
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await waitFor( () => {
			expect( screen.queryByRole( 'alert' ) ).toBeNull();
		} );
	} );

	test( 'reset error message when email is empty', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type( screen.getByRole( 'textbox', { name: 'Your email' } ), 'invalid email' );
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await userEvent.clear( screen.getByRole( 'textbox', { name: 'Your email' } ) );
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await waitFor( () => {
			expect( screen.queryByRole( 'alert' ) ).toBeNull();
		} );
	} );
} );
