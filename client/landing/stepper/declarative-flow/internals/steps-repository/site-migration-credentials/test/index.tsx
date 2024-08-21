/**
 * @jest-environment jsdom
 */
import { waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import SiteMigrationCredentials from '..';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param' );

( useSiteSlugParam as jest.Mock ).mockImplementation( () => 'https://site-url.wordpress.com' );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationCredentials { ...combinedProps } />, renderOptions );
};

const messages = {
	urlError: 'Please enter your WordPress site address.',
	usernameError: 'Please enter your WordPress admin username.',
	passwordError: 'Please enter your WordPress admin password.',
	noTLDError:
		"Looks like your site address is missing its domain extension. Please try again with something like 'example.com' or 'example.net'.",
};

describe( 'SiteMigrationCredentials', () => {
	beforeAll( () => nock.disableNetConnect() );

	it( 'renders the form', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		expect( screen.queryByRole( 'button', { name: /Continue/ } ) ).toBeInTheDocument();
		expect( screen.queryByText( 'How can we access your site?' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Site address' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'WordPress admin username' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Password' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Notes (optional)' ) ).toBeInTheDocument();
	} );

	it( 'does not show any error message by default', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		expect( screen.queryByText( messages.urlError ) ).not.toBeInTheDocument();
		expect( screen.queryByText( messages.usernameError ) ).not.toBeInTheDocument();
	} );

	it.each( [
		[
			'site-url.com',
			'username',
			'password',
			[],
			[ messages.passwordError, messages.urlError, messages.usernameError ],
		],
		[
			'siteurlnotld',
			'username',
			'password',
			[ messages.noTLDError ],
			[ messages.passwordError, messages.urlError, messages.usernameError ],
		],
		[
			'',
			'username',
			'password',
			[ messages.urlError ],
			[ messages.passwordError, messages.usernameError ],
		],
		[
			'',
			'',
			'password',
			[ messages.urlError, messages.usernameError ],
			[ messages.passwordError ],
		],
		[
			'',
			'username',
			'',
			[ messages.urlError, messages.passwordError ],
			[ messages.usernameError ],
		],
		[ '', '     ', '', [ messages.urlError, messages.usernameError ], [] ],
		[
			'backup-url.com',
			'username',
			'',
			[ messages.passwordError ],
			[ messages.usernameError, messages.urlError ],
		],
		[
			'backup-url.com',
			'',
			'',
			[ messages.usernameError ],
			[ messages.urlError, messages.passwordError ],
		],
		[ '', '', '', [ messages.usernameError, messages.urlError ], [ messages.passwordError ] ],
	] )(
		'shows correct error messages for url:%s--username:%s--pass:%s--',
		async ( siteAddress, username, password, expectedErrors, notExpectedErrors ) => {
			const submit = jest.fn();
			render( { navigation: { submit } } );

			const addressInput = screen.getByLabelText( /Site address/ );
			const usernameInput = screen.getByLabelText( /WordPress admin username/ );
			const passwordInput = screen.getByLabelText( /Password/ );
			const notesInput = screen.getByLabelText( /Notes \(optional\)/ );

			siteAddress && ( await userEvent.type( addressInput, siteAddress ) );
			username && ( await userEvent.type( usernameInput, username ) );
			password && ( await userEvent.type( passwordInput, password ) );
			await userEvent.type( notesInput, 'notes' );

			await waitFor( async () => {
				await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );
			} );

			expectedErrors.forEach( ( text ) => {
				expect( screen.queryByText( text ) ).toBeInTheDocument();
			} );

			notExpectedErrors.forEach( ( text ) => {
				expect( screen.queryByText( text ) ).not.toBeInTheDocument();
			} );
		}
	);

	it.each( [
		[
			'credentials',
			'site-url.com',
			'username',
			'password',
			[],
			[ messages.passwordError, messages.urlError, messages.usernameError ],
		],
		[
			'backup',
			'backupsite-url.com',
			'',
			'',
			[],
			[ messages.passwordError, messages.urlError, messages.usernameError ],
		],
	] )(
		'sends correctly formed request',
		async (
			howToAccessSite,
			siteAddress,
			username,
			password,
			expectedErrors,
			notExpectedErrors
		) => {
			( wpcomRequest as jest.Mock ).mockClear();
			const submit = jest.fn();
			render( { navigation: { submit } } );

			const isBackupRequest = howToAccessSite === 'backup';

			if ( isBackupRequest ) {
				const backupRadio = screen.getByLabelText( 'Backup file' );
				await userEvent.click( backupRadio );
			}

			const addressInput = screen.getByLabelText(
				isBackupRequest ? /Backup file location/ : /Site address/
			);
			const notesInput = screen.getByLabelText( /Notes \(optional\)/ );

			await userEvent.type( addressInput, siteAddress );
			username &&
				( await userEvent.type( screen.getByLabelText( /WordPress admin username/ ), username ) );
			password && ( await userEvent.type( screen.getByLabelText( /Password/ ), password ) );
			await userEvent.type( notesInput, 'notes' );

			await waitFor( async () => {
				await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );
			} );

			await waitFor( async () => {
				expect( wpcomRequest ).toHaveBeenCalledWith( {
					path: 'help/automated-migration',
					apiNamespace: 'wpcom/v2/',
					apiVersion: '2',
					method: 'POST',
					body: {
						migration_type: howToAccessSite,
						blog_url: 'https://site-url.wordpress.com',
						notes: 'notes',
						from_url: siteAddress,
						...( isBackupRequest
							? {}
							: {
									username,
									password,
							  } ),
					},
				} );
			} );

			expectedErrors.forEach( ( text ) => {
				expect( screen.queryByText( text ) ).toBeInTheDocument();
			} );
			notExpectedErrors.forEach( ( text ) => {
				expect( screen.queryByText( text ) ).not.toBeInTheDocument();
			} );
		}
	);

	it.each( [
		[
			'Enter a valid URL.',
			{
				code: 'rest_invalid_param',
				message: 'Test',
				data: { params: { from_url: 'Invalid Param' } },
			},
		],
		[
			'Enter a valid username.',
			{
				code: 'rest_invalid_param',
				message: 'Test',
				data: { params: { username: 'Invalid Param' } },
			},
		],
		[
			'Invalid input, please check again',
			{
				code: 'rest_invalid_param',
				message: 'Test note',
				data: { params: { notes: 'Invalid Param' } },
			},
		],
		[
			'Enter a valid password.',
			{
				code: 'rest_invalid_param',
				message: 'Test',
				data: { params: { password: 'Invalid Param' } },
			},
		],
		[
			'An error occurred while saving credentials.',
			{
				code: 'rest_invalid_param',
				message: 'Test',
				data: { params: { nonexistant: 'Invalid Param' } },
			},
		],
		[
			'A test message',
			{
				code: 'rest_other_error',
				message: 'A test message',
				data: {},
			},
		],
		[
			'An error occurred while saving credentials.',
			{
				code: 'rest_other_error_no_message',
				data: {},
			},
		],
	] )(
		'shows correct error messages after server validation -- %s -- %p',
		async ( message, errorResponse ) => {
			( wpcomRequest as jest.Mock ).mockClear();

			const submit = jest.fn();
			render( { navigation: { submit } } );

			await userEvent.type( screen.getByLabelText( /Site address/ ), 'test.com' );
			await userEvent.type( screen.getByLabelText( /WordPress admin username/ ), 'username' );
			await userEvent.type( screen.getByLabelText( /Password/ ), 'password' );
			await userEvent.type( screen.getByLabelText( /Notes \(optional\)/ ), 'notes' );

			( wpcomRequest as jest.Mock ).mockRejectedValue( errorResponse );

			await waitFor( async () => {
				await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );
			} );

			await waitFor( async () => {
				expect( wpcomRequest ).toHaveBeenCalledWith( {
					path: 'help/automated-migration',
					apiNamespace: 'wpcom/v2/',
					apiVersion: '2',
					method: 'POST',
					body: {
						migration_type: 'credentials',
						blog_url: 'https://site-url.wordpress.com',
						notes: 'notes',
						from_url: 'test.com',
						username: 'username',
						password: 'password',
					},
				} );
			} );

			await waitFor( () => {
				expect( screen.queryByText( message ) ).toBeInTheDocument();
			} );
		}
	);
} );
