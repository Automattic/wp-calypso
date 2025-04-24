/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
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
		post: jest.fn(),
	},
} ) );

jest.mock( 'wpcom-proxy-request', () => jest.fn() );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param' );

( useSiteSlugParam as jest.Mock ).mockImplementation( () => 'site-url.wordpress.com' );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationCredentials { ...combinedProps } />, renderOptions );
};

const { getByRole, getByLabelText, getByTestId, getByText, findByText } = screen;

const continueButton = ( name = /Continue/ ) => getByRole( 'button', { name } );
const usernameInput = () => getByLabelText( 'WordPress admin username' );
const passwordInput = () => getByLabelText( 'Password' );
const specialInstructionsInput = () => getByTestId( 'special-instructions-textarea' );
const specialInstructionsButton = () => getByRole( 'button', { name: 'Special instructions' } );
const skipButton = () => getByRole( 'button', { name: /I need help, please contact me/ } );

const fillAllFields = async () => {
	await userEvent.type( usernameInput(), 'username' );
	await userEvent.type( passwordInput(), 'password' );
};

const baseSiteInfo = {
	url: 'https://site-url.wordpress.com',
	platform: 'wordpress',
	platform_data: {
		is_wpcom: false,
	},
};

const siteInfoUsingWordPress = {
	...baseSiteInfo,
	platform: 'wordpress',
};

describe( 'SiteMigrationCredentials', () => {
	beforeAll( () => nock.disableNetConnect() );
	beforeEach( () => {
		jest.clearAllMocks();
		( wp.req.get as jest.Mock ).mockResolvedValue( siteInfoUsingWordPress );
	} );

	it( 'creates an automated migration ticket', async () => {
		const submit = jest.fn();
		const initialEntry = '/site-migration-credentials?from=site-url.com';

		render( { navigation: { submit } }, { initialEntry } );

		await userEvent.type( usernameInput(), 'username' );
		await userEvent.type( passwordInput(), 'password' );

		await userEvent.click( specialInstructionsButton() );
		await userEvent.type( specialInstructionsInput(), 'notes' );
		await userEvent.click( continueButton() );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: '/sites/site-url.wordpress.com/automated-migration?_locale=en',
			apiNamespace: 'wpcom/v2',
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
			expect( submit ).toHaveBeenCalledWith( {
				action: 'submit',
				from: 'site-url.com',
			} );
		} );
	} );

	it( 'skips the credential creation when the user does not fill the fields', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( skipButton() );

		expect( submit ).toHaveBeenCalledWith( { action: 'skip' } );
		expect( wpcomRequest ).not.toHaveBeenCalled();
	} );

	it( 'shows error messages by each field when the server returns "invalid param" by each field', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		( wpcomRequest as jest.Mock ).mockRejectedValue( {
			code: 'rest_invalid_param',
			data: {
				params: {
					username: 'Invalid Param',
					password: 'Invalid Param',
					notes: 'Invalid Param',
				},
			},
		} );

		await fillAllFields();
		await userEvent.click( continueButton() );
		await waitFor( () => {
			expect( getByText( /Enter a valid username/ ) ).toBeVisible();
			expect( getByText( /Enter a valid password/ ) ).toBeVisible();
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
				expect( continueButton( /Continue anyway/ ) ).toBeVisible();
				expect(
					getByText(
						'We could not verify your credentials. Can you double check your account information and try again?'
					)
				).toBeVisible();
				expect( getByText( errorMessage ) ).toBeVisible();
			} );
		}
	);

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
