/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import useUserSettingsMutation from '../mutations/use-user-settings-mutation';
import { Parent, buildSkeleton, resetMocks } from './utils';

// Mock the useIsLoggedIn function
jest.mock( '../hooks', () => ( {
	useIsLoggedIn: jest.fn(),
} ) );

// Mock the entire Helpers module
jest.mock( '../helpers', () => ( {
	callApi: jest.fn(),
} ) );

beforeEach( () => {
	resetMocks();

	( useIsLoggedIn as jest.Mock ).mockReturnValue( true );
} );

describe( 'useUserSettingsMutation', () => {
	it( 'changes the user settings correctly if provided with proper payload', async () => {
		const body = {
			mail_option: 'html',
			delivery_day: 1,
			delivery_hour: 3,
			blocked: false,
			email: 'user@wordpress.com',
		};
		const Skeleton = buildSkeleton( useUserSettingsMutation, body );

		( callApi as jest.Mock ).mockResolvedValue( {
			settings: {
				success: true,
			},
		} );

		render(
			<Parent>
				<Skeleton />
			</Parent>
		);

		await waitFor( () =>
			expect( callApi ).toHaveBeenCalledWith( {
				path: '/read/email-settings',
				body,
				isLoggedIn: true,
				method: 'POST',
			} )
		);
	} );

	it( "throws an error showing the invalid inputs if that's the case of the failure", async () => {
		const body = {
			mail_option: 'html',
			delivery_day: 1,
			delivery_hour: 3,
			blocked: false,
			email: 'user@wordpress.com',
		};
		const Skeleton = buildSkeleton( useUserSettingsMutation, body );

		( callApi as jest.Mock ).mockResolvedValue( {
			settings: {
				errors: {
					invalid_input: [ 'email', 'mail_option' ],
				},
			},
		} );

		render(
			<Parent>
				<Skeleton />
			</Parent>
		);

		// eslint-disable-next-line
		jest.spyOn( console, 'error' ).mockImplementation( () => null );

		await waitFor( () =>
			// eslint-disable-next-line
			expect( console.error ).toHaveBeenCalledWith( new Error( 'email, mail_option' ) )
		);
	} );

	it( 'throws a different error when the error returned by the backend is not related to the inputs being valid', async () => {
		const body = {
			mail_option: 'html',
			delivery_day: 1,
			delivery_hour: 3,
			blocked: false,
			email: 'user@wordpress.com',
		};
		const Skeleton = buildSkeleton( useUserSettingsMutation, body );

		( callApi as jest.Mock ).mockResolvedValue( {
			settings: {
				errors: {
					description: 'Any other error',
				},
			},
		} );

		render(
			<Parent>
				<Skeleton />
			</Parent>
		);

		// eslint-disable-next-line
		jest.spyOn( console, 'error' ).mockImplementation( () => null );

		await waitFor( () =>
			// eslint-disable-next-line
			expect( console.error ).toHaveBeenCalledWith( new Error( 'Something went wrong.' ) )
		);
	} );
} );
