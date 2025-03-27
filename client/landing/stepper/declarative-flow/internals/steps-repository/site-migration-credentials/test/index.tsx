/**
 * @jest-environment jsdom
 */
import { waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { MigrationStatus } from 'calypso/data/site-migration/landing/types';
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

const messages = {
	urlError: 'Please enter your WordPress site address.',
	usernameError: 'Please enter your WordPress admin username.',
	passwordError: 'Please enter your WordPress admin password.',
	noTLDError:
		"Looks like your site address is missing its domain extension. Please try again with something like 'example.com' or 'example.net'.",
};

const { getByRole, getByLabelText, getByTestId, getByText, findByText } = screen;

const continueButton = ( name = /Continue/ ) => getByRole( 'button', { name } );
const siteAddressInput = () => getByLabelText( 'Current WordPress site address' );
const backupOption = () => getByRole( 'radio', { name: 'Backup file' } );
const credentialsOption = () => getByRole( 'radio', { name: 'WordPress site credentials' } );
const backupFileInput = () => getByLabelText( 'Backup file location' );
//TODO: it requires a testid because there is no accessible name, it is an issue with the component
const specialInstructionsInput = () => getByTestId( 'special-instructions-textarea' );
const specialInstructionsButton = () => getByRole( 'button', { name: 'Special instructions' } );
const skipButton = () => getByRole( 'button', { name: /Let us guide you/ } );

const fillAddressField = async () => {
	await userEvent.click( credentialsOption() );
	await userEvent.type( siteAddressInput(), 'site-url.com' );
};

const baseSiteInfo = {
	url: 'https://external-site-url.com',
	platform: 'wordpress',
	platform_data: {
		is_wpcom: false,
	},
};

const siteInfoUsingTumblr = {
	...baseSiteInfo,
	platform: 'tumblr',
	url: 'https://site-url.tumblr.com',
};

const siteInfoUsingWPCOM = {
	...baseSiteInfo,
	url: 'https://site-url.wpcomstating.com',
	platform_data: {
		is_wpcom: true,
	},
};
describe( 'SiteMigrationCredentials', () => {
	beforeAll( () => nock.disableNetConnect() );
	beforeEach( () => {
		jest.clearAllMocks();
		( wp.req.get as jest.Mock ).mockResolvedValue( baseSiteInfo );
	} );

	it( 'starts the authorization flow when using application password', async () => {
		jest.mocked( wp.req.post ).mockResolvedValue( {
			application_passwords_enabled: true,
			authorization_url: 'https://external-site-url.com/wp-admin/authorize-application.php',
		} );

		const submit = jest.fn();
		render( { navigation: { submit } } );

		await fillAddressField();
		await userEvent.click( continueButton() );

		expect( submit ).toHaveBeenCalledWith( {
			action: 'application-passwords-approval',
			platform: 'wordpress',
			authorizationUrl: 'https://external-site-url.com/wp-admin/authorize-application.php',
			from: 'https://external-site-url.com',
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
			path: '/sites/site-url.wordpress.com/automated-migration?_locale=en',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: {
				blog_url: 'site-url.wordpress.com',
				migration_type: 'backup',
				notes: 'notes',
				from_url: 'backup-file.zip',
			},
		} );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalledWith( {
				action: 'submit',
			} );
		} );
	} );

	it( 'sets a migration as pending automatically', async () => {
		render();

		await waitFor( () => {
			expect( wp.req.post ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sites/123/site-migration-status-sticker',
					body: { status_sticker: MigrationStatus.PENDING_DIFM },
				} )
			);
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
		await waitFor( () => {
			expect( getByText( messages.urlError ) ).toBeVisible();
		} );
	} );

	it( 'shows errors on the required fields when the user does not fill the fields when user select backup option', async () => {
		render();

		await userEvent.click( backupOption() );
		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( getByText( /Please enter a valid URL/ ) ).toBeVisible();
		} );
	} );

	it( 'shows error when user set invalid site address', async () => {
		render();

		await userEvent.type( siteAddressInput(), 'invalid-site-address' );
		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( getByText( messages.noTLDError ) ).toBeVisible();
		} );
	} );

	it( 'shows error message when there is an error on the with the backup file', async () => {
		const submit = jest.fn();

		( wpcomRequest as jest.Mock ).mockRejectedValue( {
			code: 'rest_invalid_param',
			data: {
				params: {
					from_url: 'Invalid Param',
				},
			},
		} );

		render( { navigation: { submit } } );
		await userEvent.click( backupOption() );
		await userEvent.type( backupFileInput(), 'backup-file.zip' );
		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( getByText( /Enter a valid URL/ ) ).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
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

	it( 'shows "Scanning site" on the Continue button during submission with application password', async () => {
		const submit = jest.fn();
		const pendingPromise = new Promise( () => {} );
		( wpcomRequest as jest.Mock ).mockImplementation( () => pendingPromise );

		render( { navigation: { submit } } );
		await fillAddressField();
		userEvent.click( continueButton() );

		await waitFor( () => {
			expect( continueButton( /Scanning site/ ) ).toBeVisible();
		} );
	} );

	it( 'shows "Scanning site" on the Continue button during submission when fetching site info with application password', async () => {
		const submit = jest.fn();

		const pendingPromise = new Promise( () => {} );

		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			status: 200,
			body: {},
		} );

		( wp.req.get as jest.Mock ).mockImplementation( () => pendingPromise );

		render( { navigation: { submit } } );
		await fillAddressField();
		await userEvent.click( continueButton() );

		await waitFor( () => {
			expect( continueButton( /Scanning site/ ) ).toBeVisible();
		} );
	} );

	it( 'submits credentials-required action when there is an error on to get the authorization path', async () => {
		const submit = jest.fn();
		( wp.req.post as jest.Mock ).mockRejectedValue( {
			code: 'failed_to_get_authorization_path',
		} );

		render( { navigation: { submit } } );
		await fillAddressField();
		await userEvent.click( continueButton() );

		expect( submit ).toHaveBeenCalledWith( {
			action: 'credentials-required',
			from: 'https://external-site-url.com',
			platform: 'wordpress',
		} );
	} );

	it( 'submits already-wpcom action when site is already WPCOM', async () => {
		const submit = jest.fn();
		( wp.req.get as jest.Mock ).mockResolvedValue( siteInfoUsingWPCOM );
		( wpcomRequest as jest.Mock ).mockResolvedValue( {
			status: 200,
			body: {},
		} );

		render( { navigation: { submit } } );
		await fillAddressField();
		await userEvent.click( continueButton() );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: '/help/migration-ticket/new',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: {
				locale: 'en',
				blog_url: 'site-url.wordpress.com',
				from_url: 'site-url.com',
			},
		} );
		expect( submit ).toHaveBeenCalledWith( {
			action: 'already-wpcom',
			from: 'https://site-url.wpcomstating.com',
			platform: 'wordpress',
		} );
	} );

	it( 'submits site-is-not-using-wordpress action when platform is not wordpress', async () => {
		const submit = jest.fn();
		( wp.req.get as jest.Mock ).mockResolvedValue( siteInfoUsingTumblr );

		render( { navigation: { submit } } );
		await fillAddressField();
		await userEvent.click( continueButton() );

		expect( submit ).toHaveBeenCalledWith( {
			action: 'site-is-not-using-wordpress',
			from: 'https://site-url.tumblr.com',
			platform: 'tumblr',
		} );
	} );
} );
