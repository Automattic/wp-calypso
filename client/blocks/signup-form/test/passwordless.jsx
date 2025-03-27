/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import PasswordlessSignupForm from '../passwordless';

describe( 'createAccountError', () => {
	const mockStore = configureStore( [ thunk ] );

	const renderFormAndSubmit = async () => {
		const onCreateAccountError = jest.fn();
		const store = mockStore( {} );

		render(
			<Provider store={ store }>
				<PasswordlessSignupForm onCreateAccountError={ onCreateAccountError } />
			</Provider>
		);

		const emailInput = screen.getByRole( 'textbox', { name: /email/i } );
		fireEvent.change( emailInput, { target: { value: 'test@example.com' } } );

		const submitButton = screen.getByRole( 'button', { name: /create your account/i } );
		fireEvent.click( submitButton );
	};

	it( 'should handle throttled errors', async () => {
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/users/new' ).reply( 403, {
			error: 'throttled',
		} );

		await renderFormAndSubmit();

		await waitFor( () => {
			expect( screen.getByText( /Too many attempts/i ) ).toBeInTheDocument();
		} );
	} );

	it( 'should handle generic errors', async () => {
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/users/new' ).reply( 500, {
			error: 'internal_server_error',
		} );

		await renderFormAndSubmit();

		await waitFor( () => {
			expect( screen.getByText( /something went wrong /i ) ).toBeInTheDocument();
		} );
	} );
} );
