/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SecurityKeyForm } from '../security-key-form';

describe( 'SecurityKeyForm', () => {
	const currentUserId = 123;
	const translate = ( str: string ) => str;
	const loginUserWithSecurityKey = jest.fn();
	const fetch = jest.fn();

	const setup = () =>
		render(
			<SecurityKeyForm
				twoStepAuthorization={ {
					loginUserWithSecurityKey,
					fetch,
				} }
				translate={ translate }
				currentUserId={ currentUserId }
			/>
		);

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	test( 'prompts immediately and shows spinner and waiting message', async () => {
		// Never resolves, simulates loading
		loginUserWithSecurityKey.mockReturnValue( new Promise( () => {} ) );

		const { findByText, getByText, getByRole } = setup();

		await findByText( 'Waiting for security key' );
		expect( getByText( 'Waiting for security key' ) ).toBeVisible();
		expect( getByText( /Connect and touch your security key to log in/ ) ).toBeVisible();
		expect( getByRole( 'button', { name: 'Continue with security key' } ) ).toBeVisible();
	} );

	test( 'shows error and allows user to retry authentication on client failure', async () => {
		const { reject, promise } = Promise.withResolvers();
		loginUserWithSecurityKey.mockReturnValue( promise );

		const { findByText, getByText, getByRole } = setup();

		// Wait for the spinner to appear (auth in progress)
		await findByText( 'Waiting for security key' );

		// Resolve the initial authentication
		reject( new Error() );

		await waitFor( () => {
			expect( getByText( /An error occurred, please try again/ ) ).toBeVisible();
		} );

		// Now click the button to trigger another authentication
		await userEvent.click( getByRole( 'button', { name: 'Continue with security key' } ) );
		await waitFor( () => {
			expect( loginUserWithSecurityKey ).toHaveBeenCalledTimes( 2 );
			expect( loginUserWithSecurityKey ).toHaveBeenLastCalledWith( { user_id: currentUserId } );
		} );
	} );

	test( 'retries once automatically on invalid_two_step_nonce', async () => {
		const error = { data: { errors: [ { code: 'invalid_two_step_nonce' } ] } };
		loginUserWithSecurityKey.mockRejectedValue( error );
		fetch.mockImplementation( ( cb ) => cb() );

		setup();

		await waitFor( () => {
			expect( fetch ).toHaveBeenCalledTimes( 2 );
			expect( loginUserWithSecurityKey ).toHaveBeenCalledTimes( 2 );
		} );
	} );
} );
