/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { MigrationStatus } from 'calypso/data/site-migration/landing/types';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import wp from 'calypso/lib/wp';
import SiteMigrationCredentials from '..';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

const mockFlowState = new Map< string, unknown >();

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn( () => ( {
		get: jest.fn( ( key: string ) => mockFlowState.get( key ) ),
		set: jest.fn( ( key: string, value: unknown ) => mockFlowState.set( key, value ) ),
	} ) ),
} ) );
jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
		post: jest.fn(),
	},
} ) );
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
const credentialsOption = () => getByRole( 'radio', { name: 'Site address' } );
const backupFileInput = () => getByLabelText( 'Backup file location' );
//TODO: it requires a testid because there is no accessible name, it is an issue with the component
const specialInstructionsInput = () => getByTestId( 'special-instructions-textarea' );
const specialInstructionsButton = () => getByRole( 'button', { name: 'Special instructions' } );
const skipButton = () => getByRole( 'button', { name: /Have our team email you/ } );

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
		mockFlowState.clear();
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
		mockFlowState.set( 'migrationSourceUrl', 'original.example.com' );
		render( { navigation: { submit } } );

		await userEvent.click( backupOption() );
		await userEvent.type( backupFileInput(), 'backup-file.zip' );
		await userEvent.click( specialInstructionsButton() );
		await userEvent.type( specialInstructionsInput(), 'notes' );
		await userEvent.click( continueButton() );

		//TODO: Ideally we should use nock to mock the request, but it is not working with the current implementation due to wpcomRequest usage that is well captured by nock.
		expect( wp.req.post ).toHaveBeenCalledWith(
			{
				path: '/sites/site-url.wordpress.com/automated-migration?_locale=en',
				apiNamespace: 'wpcom/v2',
			},
			{},
			{
				blog_url: 'site-url.wordpress.com',
				migration_type: 'backup',
				notes: 'notes',
				from_url: 'backup-file.zip',
			}
		);

		await waitFor( () => {
			expect( submit ).toHaveBeenCalledWith( {
				action: 'submit',
			} );
		} );
		expect( mockFlowState.get( 'migrationSourceUrl' ) ).toBe( 'original.example.com' );
	} );

	it( 'sets a migration as pending automatically', async () => {
		render();

		await waitFor( () => {
			expect( wp.req.post ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sites/123/site-migration-status-sticker',
					body: { status_sticker: MigrationStatus.STARTED_DIFM },
				} )
			);
		} );
	} );

	it( 'skips the credential creation when the user does not fill the fields', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( skipButton() );

		expect( wp.req.post ).toHaveBeenCalledWith(
			{ path: '/help/migration-ticket/new', apiNamespace: 'wpcom/v2' },
			{},
			expect.objectContaining( { blog_url: 'site-url.wordpress.com', context: 'help_requested' } )
		);
		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'skip' } ) );
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

		( wp.req.post as jest.Mock ).mockRejectedValue( {
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

	it( 'links the logo to the homepage as its way out, without a Back button', () => {
		render( { navigation: { goBack: jest.fn(), submit: jest.fn() } } );

		expect( screen.getByRole( 'link', { name: 'WordPress.com home' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/'
		);
		expect( screen.queryByRole( 'button', { name: /Back/ } ) ).not.toBeInTheDocument();
		expect( skipButton() ).toBeVisible();
	} );

	it( 'shows "Scanning site" on the Continue button during submission with application password', async () => {
		const submit = jest.fn();
		const pendingPromise = new Promise( () => {} );
		( wp.req.post as jest.Mock ).mockImplementation( () => pendingPromise );

		render( { navigation: { submit } } );
		await fillAddressField();
		userEvent.click( continueButton() );

		await waitFor( () => {
			expect( continueButton( /Scanning site/ ) ).toBeVisible();
		} );
		expect( continueButton( /Scanning site/ ) ).toBeDisabled();
	} );

	it( 'shows "Scanning site" on the Continue button during submission when fetching site info with application password', async () => {
		const submit = jest.fn();

		const pendingPromise = new Promise( () => {} );

		( wp.req.post as jest.Mock ).mockResolvedValue( {
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
		expect( continueButton( /Scanning site/ ) ).toBeDisabled();
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
		( wp.req.post as jest.Mock ).mockResolvedValue( {
			status: 200,
			body: {},
		} );

		render( { navigation: { submit } } );
		await fillAddressField();
		await userEvent.click( continueButton() );

		expect( wp.req.post ).toHaveBeenCalledWith(
			{
				path: '/help/migration-ticket/new',
				apiNamespace: 'wpcom/v2',
			},
			{},
			{
				locale: 'en',
				blog_url: 'site-url.wordpress.com',
				from_url: 'site-url.com',
			}
		);
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

	describe( 'saved source address', () => {
		const initialEntry = '/site-migration-credentials?from=https%3A%2F%2Fredirected.example.com%2F';

		beforeEach( () => {
			mockFlowState.set( 'migrationSourceUrl', 'original.example.com' );
			jest.mocked( wp.req.post ).mockResolvedValue( {
				application_passwords_enabled: false,
			} );
		} );

		it.each( [ 'edited.example.com', 'https://edited.example.com/blog/?tag=test#section' ] )(
			'remembers the confirmed edit %s while submitting the analyzed address',
			async ( enteredUrl ) => {
				const user = userEvent.setup();
				const submit = jest.fn();
				render( { navigation: { submit } }, { initialEntry } );

				await user.clear( siteAddressInput() );
				await user.type( siteAddressInput(), enteredUrl );
				await user.click( continueButton() );
				await waitFor( () =>
					expect( submit ).toHaveBeenCalledWith( {
						action: 'credentials-required',
						from: baseSiteInfo.url,
						platform: 'wordpress',
					} )
				);

				expect( mockFlowState.get( 'migrationSourceUrl' ) ).toBe( enteredUrl );
			}
		);

		it( 'keeps the original entry when the redirected address is submitted unchanged', async () => {
			const user = userEvent.setup();
			const submit = jest.fn();
			render( { navigation: { submit } }, { initialEntry } );

			expect( siteAddressInput() ).toHaveValue( 'https://redirected.example.com' );
			await user.click( continueButton() );
			await waitFor( () => expect( submit ).toHaveBeenCalled() );

			expect( mockFlowState.get( 'migrationSourceUrl' ) ).toBe( 'original.example.com' );
		} );

		it( 'keeps the last confirmed entry while an edit is unsubmitted or invalid', async () => {
			const user = userEvent.setup();
			const submit = jest.fn();
			render( { navigation: { submit } }, { initialEntry } );

			await user.clear( siteAddressInput() );
			await user.type( siteAddressInput(), 'edited.example.com' );
			expect( mockFlowState.get( 'migrationSourceUrl' ) ).toBe( 'original.example.com' );

			await user.clear( siteAddressInput() );
			await user.type( siteAddressInput(), 'invalid-site-address' );
			await user.click( continueButton() );
			expect( await screen.findByText( messages.noTLDError ) ).toBeVisible();

			expect( submit ).not.toHaveBeenCalled();
			expect( mockFlowState.get( 'migrationSourceUrl' ) ).toBe( 'original.example.com' );
		} );

		it( 'remembers a confirmed edit back to the initial credentials address', async () => {
			const user = userEvent.setup();
			const submit = jest.fn();
			render( { navigation: { submit } }, { initialEntry } );

			await user.clear( siteAddressInput() );
			await user.type( siteAddressInput(), 'edited.example.com' );
			await user.click( continueButton() );
			await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );
			await waitFor( () => expect( siteAddressInput() ).toBeEnabled() );

			await user.clear( siteAddressInput() );
			await user.type( siteAddressInput(), 'https://redirected.example.com' );
			await user.click( continueButton() );
			await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 2 ) );

			expect( mockFlowState.get( 'migrationSourceUrl' ) ).toBe( 'https://redirected.example.com' );
		} );
	} );

	describe( 'when our team can’t be sent the migration request', () => {
		const rejectPath = ( path: string, error: object ) =>
			( wp.req.post as jest.Mock ).mockImplementation( ( params ) =>
				( params?.path ?? '' ).includes( path ) ? Promise.reject( error ) : Promise.resolve( {} )
			);

		it( 'tells the customer our team will reach out when wpcom refused the request', async () => {
			const submit = jest.fn();
			rejectPath( 'application-passwords/setup', {
				code: 'migration_request_not_submitted',
				message: 'Server message',
			} );

			render( { navigation: { submit } } );
			await fillAddressField();
			await userEvent.click( continueButton() );

			expect(
				await findByText(
					'We couldn’t submit your migration request automatically. Our team has been notified and will reach out by email.'
				)
			).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'tells the customer they reached today’s limit', async () => {
			const submit = jest.fn();
			rejectPath( 'application-passwords/setup', { code: 'too_many_requests' } );

			render( { navigation: { submit } } );
			await fillAddressField();
			await userEvent.click( continueButton() );

			expect(
				await findByText( /You’ve already sent us several migration requests today/ )
			).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'asks the customer to try again when the ticket could not be created', async () => {
			const submit = jest.fn();
			rejectPath( 'application-passwords/setup', { code: 'ticket_creation_failed' } );

			render( { navigation: { submit } } );
			await fillAddressField();
			await userEvent.click( continueButton() );

			expect(
				await findByText(
					'We couldn’t send your migration request just now. Please try again in a few minutes.'
				)
			).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'moves the customer on when the setup call fails for a reason unrelated to the ticket', async () => {
			const submit = jest.fn();
			rejectPath( 'application-passwords/setup', { code: 'rest_forbidden' } );

			render( { navigation: { submit } } );
			await fillAddressField();
			await userEvent.click( continueButton() );

			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { action: 'submit' } ) )
			);
		} );

		it( 'keeps the customer on the step when the ticket for a WordPress.com site fails', async () => {
			const submit = jest.fn();
			( wp.req.get as jest.Mock ).mockResolvedValue( siteInfoUsingWPCOM );
			rejectPath( '/help/migration-ticket/new', { code: 'internal_error' } );

			render( { navigation: { submit } } );
			await fillAddressField();
			await userEvent.click( continueButton() );

			expect(
				await findByText(
					'We couldn’t send your migration request just now. Please try again in a few minutes.'
				)
			).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'keeps the customer on the step when the ticket for a site not on WordPress fails', async () => {
			const submit = jest.fn();
			( wp.req.get as jest.Mock ).mockResolvedValue( siteInfoUsingTumblr );
			rejectPath( '/help/migration-ticket/new', { code: 'too_many_requests' } );

			render( { navigation: { submit } } );
			await fillAddressField();
			await userEvent.click( continueButton() );

			expect(
				await findByText( /You’ve already sent us several migration requests today/ )
			).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'tells the customer our team will reach out when a backup request is refused', async () => {
			const submit = jest.fn();
			rejectPath( '/automated-migration?', {
				code: 'migration_request_not_submitted',
				message: 'Server message',
			} );

			render( { navigation: { submit } } );
			await userEvent.click( backupOption() );
			await userEvent.type( backupFileInput(), 'backup-file.zip' );
			await userEvent.click( continueButton() );

			expect(
				await findByText(
					'We couldn’t submit your migration request automatically. Our team has been notified and will reach out by email.'
				)
			).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );
	} );
} );
