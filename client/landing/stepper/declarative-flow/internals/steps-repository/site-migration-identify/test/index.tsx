/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { MemoryRouter } from 'react-router';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import SiteMigrationIdentify from '..';
import { UrlData } from '../../../../../../../blocks/import/types';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn( () => ( {
		get: jest.fn().mockReturnValue( { entryPoint: 'goals' } ),
	} ) ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug' );
jest.mock(
	'../../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler',
	() => ( {
		useSitePreviewMShotImageHandler: () => ( {
			createScreenshots: jest.fn(),
		} ),
	} )
);

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationIdentify { ...combinedProps } />, renderOptions );
};

const API_RESPONSE_WORDPRESS_PLATFORM: UrlData = {
	url: 'https://example.com',
	platform: 'wordpress',
	meta: {
		title: 'Site Title',
		favicon: 'https://example.com/favicon.ico',
	},
};

const API_RESPONSE_WITH_OTHER_PLATFORM: UrlData = {
	url: 'https://example.com',
	platform: 'unknown',
	meta: {
		title: 'Site Title',
		favicon: 'https://example.com/favicon.ico',
	},
};

const MOCK_WORDPRESS_SITE_SLUG = 'test-example.wordpress.com';
const getInput = () => screen.getByLabelText( /Site address/ );
const originalIsEnabled = config.isEnabled;

describe( 'SiteMigrationIdentify', () => {
	beforeAll( () => nock.disableNetConnect() );
	beforeEach( () => {
		jest.clearAllMocks();
		jest
			.spyOn( config, 'isEnabled' )
			.mockImplementation(
				( flag ) => flag !== 'migration/reprint-flow' && originalIsEnabled( flag )
			);
	} );
	afterEach( () => jest.restoreAllMocks() );

	it( 'continues for WordPress and resubmits refreshed hosting data', async () => {
		jest.mocked( useSiteSlug ).mockReturnValue( MOCK_WORDPRESS_SITE_SLUG );

		const submit = jest.fn();
		const { rerender } = render( { navigation: { submit } } );

		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://example.com' } )
			.reply( 200, API_RESPONSE_WORDPRESS_PLATFORM );
		mockApi()
			.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
			.reply( 200, { hosting_provider: { slug: 'automattic' } } )
			.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
			.reply( 200, { hosting_provider: { slug: 'wpengine' } } );

		await userEvent.type( getInput(), 'https://example.com' );

		await userEvent.click( screen.getByRole( 'button', { name: /Check my site/ } ) );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalledWith(
				expect.objectContaining( {
					platform: 'wordpress',
					from: API_RESPONSE_WORDPRESS_PLATFORM.url,
				} )
			);
		} );
		expect( submit ).toHaveBeenCalledTimes( 1 );

		rerender(
			<MemoryRouter>
				<SiteMigrationIdentify { ...mockStepProps( { navigation: { submit } } ) } />
			</MemoryRouter>
		);
		expect( submit ).toHaveBeenCalledTimes( 1 );

		await userEvent.clear( getInput() );
		await userEvent.type( getInput(), 'https://example.com' );
		await userEvent.click( screen.getByRole( 'button', { name: /Check my site/ } ) );
		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 2 ) );
		await screen.findByRole( 'button', { name: /Check my site/ } );
		expect( submit ).toHaveBeenCalledTimes( 2 );
		expect( submit ).toHaveBeenLastCalledWith( expect.objectContaining( { host: 'wpengine' } ) );
	} );

	it( 'continues the flow when the platform is unknown', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://example.com' } )
			.reply( 200, API_RESPONSE_WITH_OTHER_PLATFORM );

		await userEvent.type( getInput(), 'https://example.com' );

		await userEvent.click( screen.getByRole( 'button', { name: /Check my site/ } ) );

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { platform: 'unknown' } ) )
		);
	} );

	it( 'calls submit with the "skip" action when the user clicks on "choose a content platform"', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click(
			screen.getByRole( 'button', { name: /pick your current platform from a list/ } )
		);

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith(
				expect.objectContaining( { action: 'skip_platform_identification' } )
			)
		);
	} );

	it( 'shows an error when the api analyzer returns error', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://example.com' } )
			.reply( 500, new Error( 'Internal Server Error' ) );

		await userEvent.type( getInput(), 'https://example.com' );

		await userEvent.click( screen.getByRole( 'button', { name: /Check my site/ } ) );

		await waitFor( () =>
			expect( screen.getByText( /Please enter a valid website / ) ).toBeVisible()
		);
	} );

	it( 'sets the input value to the site url when the "from" param is set', () => {
		render( {}, { initialEntry: '/some-path?from=existent-site.com' } );

		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'existent-site.com' );
	} );

	it( 'sends again the same value set on the url', async () => {
		const submit = jest.fn();
		render(
			{ navigation: { submit } },
			{ initialEntry: '/some-path?from=https://existent-site.com' }
		);

		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://existent-site.com' } )
			.reply( 200, API_RESPONSE_WITH_OTHER_PLATFORM );

		await userEvent.click( screen.getByRole( 'button', { name: /Check my site/ } ) );
		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { platform: 'unknown' } ) )
		);
	} );

	it( 'shows why host with us points', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		expect( screen.getByText( /Why should you host with us/ ) ).toBeVisible();
		expect(
			screen.getByText(
				/Blazing fast speeds with lightning-fast load times for a seamless experience/
			)
		).toBeVisible();
		expect(
			screen.getByText( /Unmatched reliability with 99.999% uptime and unmetered traffic./ )
		).toBeVisible();
		expect(
			screen.getByText( /Round-the-clock security monitoring and DDoS protection./ )
		).toBeVisible();
	} );

	it( 'shows the back link when the "ref" param is set', () => {
		render(
			{
				navigation: {
					goBack: jest.fn(),
					submit: jest.fn(),
				},
			},
			{ initialEntry: '/some-path?ref=goals' }
		);

		expect( screen.getByRole( 'button', { name: /Back/ } ) ).toBeVisible();
	} );

	describe( 'with migration/reprint-flow enabled', () => {
		beforeEach( () => {
			jest
				.spyOn( config, 'isEnabled' )
				.mockImplementation(
					( flag ) => flag === 'migration/reprint-flow' || originalIsEnabled( flag )
				);
		} );

		it( 'shows the simplified address screen and submits the backup choice', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );

			expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeVisible();
			expect( screen.queryByText( /Why should you host with us/ ) ).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'button', { name: /pick your current platform/ } )
			).not.toBeInTheDocument();

			await userEvent.click(
				screen.getByRole( 'button', { name: 'Only have a backup file? Our team will help you' } )
			);
			expect( submit ).toHaveBeenCalledWith( { action: 'backup_file' } );
		} );

		it( 'keeps the supplied address editable and submits the detected source and host', async () => {
			const submit = jest.fn();
			render(
				{ navigation: { submit } },
				{ initialEntry: '/some-path?from=https://old.example.com' }
			);
			expect( getInput() ).toHaveValue( 'https://old.example.com' );

			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 200, API_RESPONSE_WORDPRESS_PLATFORM );
			mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
				.reply( 200, { hosting_provider: { slug: 'bluehost' } } );

			await userEvent.clear( getInput() );
			await userEvent.type( getInput(), 'https://example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( {
					action: 'continue',
					platform: 'wordpress',
					from: 'https://example.com',
					host: 'bluehost',
				} )
			);
		} );

		it( 'shows validation feedback without submitting an invalid address', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			await userEvent.type( getInput(), 'invalid' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( screen.getByText( /site address is missing its domain extension/ ) ).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'shows the real platform and hosting checks before continuing', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			let completePlatform: ( () => void ) | undefined;
			let completeHost: ( () => void ) | undefined;
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'example.com' } )
				.reply( 200, ( _uri, _body, callback ) => {
					completePlatform = () => callback( null, API_RESPONSE_WORDPRESS_PLATFORM );
				} );
			mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
				.reply( 200, ( _uri, _body, callback ) => {
					completeHost = () => callback( null, { hosting_provider: { slug: 'bluehost' } } );
				} );
			await userEvent.type( getInput(), 'example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( screen.getByRole( 'heading', { name: 'Checking your site' } ) ).toBeVisible();
			expect( screen.getByText( 'Identifying your site platform' ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'View site ↗' } ) ).toHaveAttribute(
				'href',
				'https://example.com'
			);
			expect( screen.getByRole( 'progressbar', { name: 'Site platform' } ) ).not.toHaveAttribute(
				'value'
			);
			expect( getInput() ).not.toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
			await waitFor( () => expect( completePlatform ).toEqual( expect.any( Function ) ) );
			await act( async () => completePlatform?.() );
			await waitFor( () =>
				expect( screen.getByText( 'Checking your hosting provider' ) ).toBeVisible()
			);
			expect( screen.getByRole( 'link', { name: 'WordPress site ↗' } ) ).toBeVisible();
			expect( screen.getByRole( 'progressbar', { name: 'Site platform' } ) ).toHaveAttribute(
				'value',
				'100'
			);
			expect( screen.getByRole( 'progressbar', { name: 'Hosting provider' } ) ).not.toHaveAttribute(
				'value'
			);
			await waitFor( () => expect( completeHost ).toEqual( expect.any( Function ) ) );
			await act( async () => completeHost?.() );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( {
					action: 'continue',
					from: 'https://example.com',
					platform: 'wordpress',
					host: 'bluehost',
				} )
			);
		} );

		it( 'returns to the entered address on Back without completing the abandoned check', async () => {
			const submit = jest.fn();
			const goBack = jest.fn();
			render( { navigation: { submit, goBack } } );
			let completeAnalysis: ( () => void ) | undefined;
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 200, ( _uri, _body, callback ) => {
					completeAnalysis = () => callback( null, API_RESPONSE_WORDPRESS_PLATFORM );
				} );
			await userEvent.type( getInput(), 'https://example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await screen.findByRole( 'heading', { name: 'Checking your site' } );
			await waitFor( () => expect( completeAnalysis ).toEqual( expect.any( Function ) ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
			expect( getInput() ).toBeVisible();
			expect( getInput() ).toHaveValue( 'https://example.com' );
			await act( async () => completeAnalysis?.() );
			expect( submit ).not.toHaveBeenCalled();
			expect( goBack ).not.toHaveBeenCalled();
		} );

		it( 'keeps generic API failures on the address form instead of claiming the source is unreachable', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 500 );
			await userEvent.type( getInput(), 'https://example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await waitFor( () =>
				expect( screen.getByText( /Please enter a valid website/ ) ).toBeVisible()
			);
			expect( getInput() ).toBeVisible();
			expect( getInput() ).toHaveValue( 'https://example.com' );
			expect(
				screen.queryByRole( 'heading', { name: 'Checking your site' } )
			).not.toBeInTheDocument();
			expect( submit ).not.toHaveBeenCalled();

			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 200, API_RESPONSE_WORDPRESS_PLATFORM );
			mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
				.reply( 200, { hosting_provider: { slug: 'bluehost' } } );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith(
					expect.objectContaining( { from: 'https://example.com', host: 'bluehost' } )
				)
			);
		} );

		it.each( [ 'unreachable', 'server_error', 'blocked', 'auth_required', 'not_found' ] as const )(
			'shows the unreachable outcome for a %s source even when WordPress is detected',
			async ( site_health ) => {
				const submit = jest.fn();
				render( { navigation: { submit } } );
				mockApi()
					.get( '/wpcom/v2/imports/analyze-url' )
					.query( { site_url: 'https://example.com' } )
					.reply( 200, { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health } );
				await userEvent.type( getInput(), 'https://example.com' );
				await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
				expect(
					await screen.findByRole( 'heading', { name: 'We couldn’t reach your site' } )
				).toBeVisible();
				expect( screen.getByText( 'Couldn’t connect', { selector: 'span' } ) ).toBeVisible();
				expect( screen.queryByText( /tried 3 times/ ) ).not.toBeInTheDocument();
				expect( screen.getByRole( 'button', { name: 'Talk to the team' } ) ).toBeDisabled();
				expect( getInput() ).not.toBeVisible();
				expect( submit ).not.toHaveBeenCalled();
				await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
				expect( getInput() ).toBeVisible();
				expect( getInput() ).toHaveValue( 'https://example.com' );
				expect( submit ).not.toHaveBeenCalled();
			}
		);

		it.each( [
			{ code: 'http_request_failed', status: 500 },
			{ code: 'rest_invalid_param', status: 400, data: { site_health: 'not_found' } },
		] )(
			'retries a source-fetch error without losing the entered address: %j',
			async ( { status, ...error } ) => {
				const submit = jest.fn();
				render( { navigation: { submit } } );
				mockApi()
					.get( '/wpcom/v2/imports/analyze-url' )
					.query( { site_url: 'https://example.com' } )
					.reply( status, error );
				await userEvent.type( getInput(), 'https://example.com' );
				await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
				expect(
					await screen.findByRole( 'heading', { name: 'We couldn’t reach your site' } )
				).toBeVisible();
				expect( submit ).not.toHaveBeenCalled();
				mockApi()
					.get( '/wpcom/v2/imports/analyze-url' )
					.query( { site_url: 'https://example.com' } )
					.reply( 200, { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'ok' } );
				mockApi()
					.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
					.reply( 200, { hosting_provider: { slug: 'bluehost' } } );
				await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
				await waitFor( () =>
					expect( submit ).toHaveBeenCalledWith( {
						action: 'continue',
						from: 'https://example.com',
						platform: 'wordpress',
						host: 'bluehost',
					} )
				);
			}
		);

		it( 'blocks the resolved HTTP source and retries without adding navigation context', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 200, {
					...API_RESPONSE_WORDPRESS_PLATFORM,
					url: 'http://example.com/',
					site_health: 'ok',
				} );
			await userEvent.type( getInput(), 'https://example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			expect(
				await screen.findByRole( 'heading', { name: 'Your site isn’t on HTTPS' } )
			).toBeVisible();
			expect(
				screen.getByText( 'example.com uses plain HTTP', { selector: 'span' } )
			).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'WordPress site ↗' } ) ).toHaveAttribute(
				'href',
				'http://example.com/'
			);
			expect( screen.getByRole( 'button', { name: 'How to enable HTTPS ↗' } ) ).toBeDisabled();
			expect( submit ).not.toHaveBeenCalled();
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 200, { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'ok' } );
			mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
				.reply( 200, { hosting_provider: { slug: 'bluehost' } } );
			await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith(
					expect.objectContaining( { from: 'https://example.com' } )
				)
			);
		} );

		it( 'continues when an entered HTTP URL resolves to HTTPS', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'http://example.com' } )
				.reply( 200, { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'ok' } );
			mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
				.reply( 200, { hosting_provider: { slug: 'bluehost' } } );
			await userEvent.type( getInput(), 'http://example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith(
					expect.objectContaining( { from: 'https://example.com' } )
				)
			);
			expect(
				screen.queryByRole( 'heading', { name: 'Your site isn’t on HTTPS' } )
			).not.toBeInTheDocument();
		} );

		it( 'restores the entered address on Back from the HTTP outcome', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'http://example.com' } )
				.reply( 200, { ...API_RESPONSE_WORDPRESS_PLATFORM, url: 'http://example.com/' } );
			await userEvent.type( getInput(), 'http://example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await screen.findByRole( 'heading', { name: 'Your site isn’t on HTTPS' } );
			await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
			expect( getInput() ).toBeVisible();
			expect( getInput() ).toHaveValue( 'http://example.com' );
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'does not complete or reopen an outcome when Back cancels a retry', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 500, { code: 'http_request_failed' } );
			await userEvent.type( getInput(), 'https://example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await screen.findByRole( 'heading', { name: 'We couldn’t reach your site' } );
			let completeRetry: ( () => void ) | undefined;
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 200, ( _uri, _body, callback ) => {
					completeRetry = () => callback( null, API_RESPONSE_WORDPRESS_PLATFORM );
				} );
			await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
			await screen.findByRole( 'heading', { name: 'Checking your site' } );
			await waitFor( () => expect( completeRetry ).toEqual( expect.any( Function ) ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
			await act( async () => completeRetry?.() );
			expect( getInput() ).toBeVisible();
			expect( getInput() ).toHaveValue( 'https://example.com' );
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'continues a healthy source when only the hosting check fails', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 200, { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'ok' } );
			mockApi().get( '/wpcom/v2/site-profiler/hosting-provider/example.com' ).reply( 500 );
			await userEvent.type( getInput(), 'https://example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith(
					expect.objectContaining( { from: 'https://example.com', host: undefined } )
				)
			);
			expect(
				screen.queryByRole( 'heading', { name: 'We couldn’t reach your site' } )
			).not.toBeInTheDocument();
		} );

		it( 'passes the WordPress.com detection result to avoid offering a full-site copy', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: 'https://example.com' } )
				.reply( 200, {
					...API_RESPONSE_WORDPRESS_PLATFORM,
					platform_data: { is_wpcom: true, is_wpengine: false, is_pressable: false },
				} );
			mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
				.reply( 200, { hosting_provider: { slug: 'automattic' } } );
			await userEvent.type( getInput(), 'https://example.com' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { isWpcom: true } ) )
			);
		} );
	} );

	it( 'keeps legacy continuation for HTTP and health metadata with the flag off', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );
		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'http://example.com' } )
			.reply( 200, {
				...API_RESPONSE_WORDPRESS_PLATFORM,
				url: 'http://example.com/',
				site_health: 'blocked',
			} );
		mockApi()
			.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
			.reply( 200, { hosting_provider: { slug: 'bluehost' } } );
		await userEvent.type( getInput(), 'http://example.com' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Check my site' } ) );
		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith(
				expect.objectContaining( { from: 'http://example.com/', platform: 'wordpress' } )
			)
		);
	} );

	it( 'hides the back button and link by default', async () => {
		render(
			{
				navigation: {
					goBack: undefined,
					submit: jest.fn(),
				},
			},
			{ initialEntry: '/some-path' }
		);

		expect( screen.queryByRole( 'button', { name: /Back/ } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: /Back/ } ) ).not.toBeInTheDocument();
	} );
} );
