/**
 * @jest-environment jsdom
 */
import { waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import wp from 'calypso/lib/wp';
import SiteMigrationCredentials from '..';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

jest.mock( 'wpcom-proxy-request', () => jest.fn() );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param' );

( useSiteSlugParam as jest.Mock ).mockImplementation( () => 'site-url.wordpress.com' );

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

const { getByRole, getByLabelText, getByTestId, getByText, findByText } = screen;

const continueButton = ( name = /Continue/ ) => getByRole( 'button', { name } );
const siteAddressInput = () => getByLabelText( 'Current site address' );
const usernameInput = () => getByLabelText( 'WordPress admin username' );
const passwordInput = () => getByLabelText( 'Password' );
const backupOption = () => getByRole( 'radio', { name: 'Backup file' } );
const credentialsOption = () => getByRole( 'radio', { name: 'WordPress credentials' } );
const backupFileInput = () => getByLabelText( 'Backup file location' );
//TODO: it requires a testid because there is no accessible name, it is an issue with the component
const specialInstructionsInput = () => getByTestId( 'special-instructions-textarea' );
const specialInstructionsButton = () => getByRole( 'button', { name: 'Special instructions' } );
const skipButton = () => getByRole( 'button', { name: /I need help, please contact me/ } );

const fillAllFields = async () => {
	await userEvent.click( credentialsOption() );
	await userEvent.type( siteAddressInput(), 'site-url.com' );
	await userEvent.type( usernameInput(), 'username' );
	await userEvent.type( passwordInput(), 'password' );
};

const fillNoteField = async () => {
	await userEvent.click( specialInstructionsButton() );
	await userEvent.type( specialInstructionsInput(), 'notes' );
};

const requestPayload = {
	path: 'sites/site-url.wordpress.com/automated-migration',
	apiNamespace: 'wpcom/v2/',
	apiVersion: '2',
	method: 'POST',
	body: {
		migration_type: 'credentials',
		blog_url: 'site-url.wordpress.com',
		bypass_verification: true,
		notes: 'notes',
		from_url: 'site-url.com',
		username: 'username',
		password: 'password',
	},
};

describe( 'SiteMigrationCredentials', () => {
	beforeAll( () => nock.disableNetConnect() );
	beforeEach( () => {
		jest.clearAllMocks();
		( wp.req.get as jest.Mock ).mockResolvedValue( {} );
	} );

	it( 'creates a credentials ticket', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( credentialsOption() );
		await userEvent.type( siteAddressInput(), 'site-url.com' );
		await userEvent.type( usernameInput(), 'username' );
		await userEvent.type( passwordInput(), 'password' );

		await userEvent.click( specialInstructionsButton() );
		await userEvent.type( specialInstructionsInput(), 'notes' );
		await userEvent.click( continueButton() );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: 'sites/site-url.wordpress.com/automated-migration',
			apiNamespace: 'wpcom/v2/',
			apiVersion: '2',
			method: 'POST',
			body: {
				migration_type: 'credentials',
				blog_url: 'site-url.wordpress.com',
				bypass_verification: false,
				notes: 'notes',
				from_url: 'site-url.com',
				username: 'username',
				password: 'password',
			},
		} );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalled();
		} );
	} );

	it( 'creates a credentials ticket when site info fetching throws error', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( credentialsOption() );
		await userEvent.type( siteAddressInput(), 'site-url.com' );
		await userEvent.type( usernameInput(), 'username' );
		await userEvent.type( passwordInput(), 'password' );

		await userEvent.click( specialInstructionsButton() );
		await userEvent.type( specialInstructionsInput(), 'notes' );

		( wp.req.get as jest.Mock ).mockRejectedValue( {
			code: 'rest_other_error',
			message: 'Error message from backend',
		} );

		await userEvent.click( continueButton() );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: 'sites/site-url.wordpress.com/automated-migration',
			apiNamespace: 'wpcom/v2/',
			apiVersion: '2',
			method: 'POST',
			body: {
				migration_type: 'credentials',
				blog_url: 'site-url.wordpress.com',
				bypass_verification: false,
				notes: 'notes',
				from_url: 'site-url.com',
				username: 'username',
				password: 'password',
			},
		} );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalled();
		} );
	} );

	it( 'creates a credentials using backup file', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( backupOption() );
		await userEvent.type( backupFileInput(), 'backup-file.zip' );
		await userEvent.click( specialInstructionsButton() );
		await userEvent.type( specialInstructionsInput(), 'notes' );
		await userEvent.click( continueButton() );

		//TODO: Ideally we should use nock to mock the request, but it is not working with the current implementation due to wpcomRequest usage that is well captured by nock.
		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: 'sites/site-url.wordpress.com/automated-migration',
			apiNamespace: 'wpcom/v2/',
			apiVersion: '2',
			method: 'POST',
			body: {
				blog_url: 'site-url.wordpress.com',
				migration_type: 'backup',
				notes: 'notes',
				from_url: 'backup-file.zip',
			},
		} );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalled();
		} );
	} );

	it( 'skips the credential creation when the user does not fill the fields', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( skipButton() );

		expect( submit ).toHaveBeenCalledWith( { action: 'skip' } );
		expect( wpcomRequest ).not.toHaveBeenCalled();
	} );

	it( 'shows errors on the required fields when the user does not fill the fields when user select credentials option', async () => {
		render();

		await userEvent.click( continueButton() );
		await userEvent.click( credentialsOption() );

		expect( getByText( messages.urlError ) ).toBeVisible();
		expect( getByText( messages.usernameError ) ).toBeVisible();
		expect( getByText( messages.passwordError ) ).toBeVisible();
	} );

	it( 'shows errors on the required fields when the user does not fill the fields when user select backup option', async () => {
		render();

		await userEvent.click( backupOption() );
		await userEvent.click( continueButton() );

		expect( getByText( /Please enter a valid URL/ ) ).toBeVisible();
	} );

	it( 'shows error when user set invalid site address', async () => {
		render();
		await userEvent.type( siteAddressInput(), 'invalid-site-address' );
		await userEvent.click( continueButton() );

		expect( getByText( messages.noTLDError ) ).toBeVisible();
	} );

	it( 'shows error messages by each field when the server returns "invalid param" by each field', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		( wpcomRequest as jest.Mock ).mockRejectedValue( {
			code: 'rest_invalid_param',
			data: {
				params: {
					from_url: 'Invalid Param',
					username: 'Invalid Param',
					password: 'Invalid Param',
					notes: 'Invalid Param',
				},
			},
		} );

		await fillAllFields();
		await userEvent.click( continueButton() );
		await waitFor( () => {
			expect( getByText( /Enter a valid URL/ ) ).toBeVisible();
			expect( getByText( /Enter a valid username/ ) ).toBeVisible();
			expect( getByText( /Enter a valid password/ ) ).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );
	} );

	it( 'shows error message when there is an error on the with the backup file', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		( wpcomRequest as jest.Mock ).mockRejectedValue( {
			code: 'rest_invalid_param',
			data: {
				params: {
					from_url: 'Invalid Param',
				},
			},
		} );

		await userEvent.click( backupOption() );
		await userEvent.type( backupFileInput(), 'backup-file.zip' );
		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( getByText( /Enter a valid URL/ ) ).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );
	} );

	it( 'shows an error message when the server returns a generic error', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		( wpcomRequest as jest.Mock ).mockRejectedValue( {
			code: 'rest_other_error',
			message: 'Error message from backend',
		} );

		await fillAllFields();
		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( getByText( /Error message from backend/ ) ).toBeVisible();
		} );
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'shows an generic error when server doesn`t return error and shows normal Continue button', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		( wpcomRequest as jest.Mock ).mockRejectedValue( {} );

		await fillAllFields();
		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( getByText( /An error occurred while saving credentials./ ) ).toBeVisible();
		} );

		await waitFor( () => {
			expect( continueButton() ).toBeVisible();
		} );
	} );

	it( 'shows a notice when URL contains error=ticket-creation', async () => {
		const submit = jest.fn();
		const initialEntry = '/site-migration-credentials?error=ticket-creation';

		render( { navigation: { submit } }, { initialEntry } );

		const errorMessage = await findByText(
			/We ran into a problem submitting your details. Please try again shortly./
		);

		await waitFor( () => {
			expect( errorMessage ).toBeVisible();
		} );
	} );

	it( 'shows "Verifying credentials" on the Continue button during submission', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );
		const pendingPromise = new Promise( () => {} );

		( wpcomRequest as jest.Mock ).mockImplementation( () => pendingPromise );

		await fillAllFields();
		userEvent.click( continueButton() );

		await waitFor( () => {
			expect( continueButton( /Verifying credentials/ ) ).toBeVisible();
		} );
	} );

	it.each( [
		{
			response_code: 404,
			errorMessage: 'Check your site address.',
		},
		{
			response_code: 401,
			errorMessage: 'Check your username.',
		},
		{
			response_code: 401,
			errorMessage: 'Check your password.',
		},
	] )(
		'shows error message for %p verification error',
		async ( { response_code, errorMessage } ) => {
			const submit = jest.fn();
			render( { navigation: { submit } } );

			( wpcomRequest as jest.Mock ).mockRejectedValue( {
				code: 'automated_migration_tools_login_and_get_cookies_test_failed',
				data: {
					response_code,
				},
			} );

			await fillAllFields();
			await userEvent.click( continueButton() );

			await waitFor( () => {
				expect( continueButton( /Continue anyways/ ) ).toBeVisible();
				expect(
					getByText(
						'We could not verify your credentials. Can you double check your account information and try again?'
					)
				).toBeVisible();
				expect( getByText( errorMessage ) ).toBeVisible();
			} );
		}
	);

	it( 'creates a credentials ticket by Continue anyways button', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( credentialsOption() );
		await userEvent.type( siteAddressInput(), 'site-url.com' );
		await userEvent.type( usernameInput(), 'username' );
		await userEvent.type( passwordInput(), 'password' );

		await fillNoteField();

		( wpcomRequest as jest.Mock ).mockRejectedValue( {
			code: 'automated_migration_tools_login_and_get_cookies_test_failed',
			data: {
				response_code: 401,
			},
		} );

		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( continueButton( /Continue anyways/ ) ).toBeVisible();
		} );

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			status: 200,
			body: {},
		} );

		await userEvent.click( continueButton( /Continue anyways/ ) );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: 'sites/site-url.wordpress.com/automated-migration',
			apiNamespace: 'wpcom/v2/',
			apiVersion: '2',
			method: 'POST',
			body: {
				migration_type: 'credentials',
				blog_url: 'site-url.wordpress.com',
				bypass_verification: true,
				notes: 'notes',
				from_url: 'site-url.com',
				username: 'username',
				password: 'password',
			},
		} );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalled();
		} );
	} );

	it( 'creates a credentials ticket even when the siteinfo request faces an error', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );
		await fillAllFields();
		await fillNoteField();

		( wp.req.get as jest.Mock ).mockRejectedValue( {
			code: 'rest_other_error',
			message: 'Error message from backend',
		} );

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			status: 200,
			body: {},
		} );

		await userEvent.click( continueButton() );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			...requestPayload,
			body: {
				...requestPayload.body,
				bypass_verification: false,
			},
		} );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalledWith( { siteInfo: undefined } );
		} );
	} );

	it( 'calls submit with siteInfo when site is not on WPCOM', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );
		await fillAllFields();
		await fillNoteField();

		const siteInfo = {
			url: 'site-url.wordpress.com',
			platform_data: {
				is_wpcom: false,
			},
		};

		( wp.req.get as jest.Mock ).mockResolvedValue( siteInfo );

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			status: 200,
			body: {},
		} );

		await userEvent.click( continueButton() );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			...requestPayload,
			body: {
				...requestPayload.body,
				bypass_verification: false,
			},
		} );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalledWith( { siteInfo } );
		} );
	} );

	it( 'shows Continue anyways button and an already on WPCOM error if site is already on WPCOM', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );
		await fillAllFields();
		await fillNoteField();

		const siteInfo = {
			url: 'site-url.wordpress.com',
			platform_data: {
				is_wpcom: true,
			},
		};

		( wp.req.get as jest.Mock ).mockResolvedValue( siteInfo );

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			status: 200,
			body: {},
		} );

		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( continueButton( /Continue anyways/ ) ).toBeVisible();
			expect( getByText( 'Your site is already on WordPress.com.' ) ).toBeVisible();
		} );

		await userEvent.click( continueButton( /Continue anyways/ ) );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			...requestPayload,
			body: {
				...requestPayload.body,
				bypass_verification: true,
			},
		} );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalledWith( { siteInfo } );
		} );
	} );

	it( 'shows "Verifying credentials" on the Continue button during submission when fetching site info', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );
		const pendingPromise = new Promise( () => {} );

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			status: 200,
			body: {},
		} );

		( wp.req.get as jest.Mock ).mockImplementation( () => pendingPromise );

		await fillAllFields();
		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( continueButton( /Verifying credentials/ ) ).toBeVisible();
		} );
	} );

	it( 'shows "Verifying credentials" on the Continue button during site info verification', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );
		const pendingPromise = new Promise( () => {} );

		await fillAllFields();

		( wpcomRequest as jest.Mock ).mockImplementation( () => pendingPromise );

		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( continueButton( /Verifying credentials/ ) ).toBeVisible();
		} );
	} );
} );
