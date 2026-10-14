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
		const mockAnalysis = ( body: object, status = 200, url = 'https://example.com' ) =>
			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: url } )
				.reply( status, body );
		const mockHost = ( status = 200 ) =>
			mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
				.reply( status, { hosting_provider: { slug: 'bluehost' } } );
		const checkSite = async ( url = 'https://example.com' ) => {
			await userEvent.type( getInput(), url );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		};

		beforeEach( () => {
			jest
				.spyOn( config, 'isEnabled' )
				.mockImplementation(
					( flag ) => flag === 'migration/reprint-flow' || originalIsEnabled( flag )
				);
		} );

		it( 'keeps the platform list available on the simplified address screen', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeVisible();
			expect( screen.queryByText( /Why should you host with us/ ) ).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'button', { name: /Only have a backup file/ } )
			).not.toBeInTheDocument();
			await userEvent.click( screen.getByRole( 'button', { name: /pick your current platform/ } ) );
			expect( submit ).toHaveBeenCalledWith( { action: 'skip_platform_identification' } );
		} );

		it( 'edits the supplied address and waits for platform and hosting checks before continuing', async () => {
			const submit = jest.fn();
			render(
				{ navigation: { submit } },
				{ initialEntry: '/some-path?from=https://old.example.com' }
			);
			expect( getInput() ).toHaveValue( 'https://old.example.com' );
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
			await userEvent.clear( getInput() );
			await checkSite( 'example.com' );

			expect( screen.getByRole( 'heading', { name: 'Checking your site' } ) ).toBeVisible();
			expect( screen.getByText( 'Identifying your site platform' ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'View site ↗' } ) ).toHaveAttribute(
				'href',
				'https://example.com'
			);
			expect( getInput() ).not.toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
			await waitFor( () => expect( completePlatform ).toEqual( expect.any( Function ) ) );
			await act( async () => completePlatform?.() );
			await waitFor( () =>
				expect( screen.getByText( 'Checking your hosting provider' ) ).toBeVisible()
			);
			expect( screen.getByRole( 'link', { name: 'WordPress site ↗' } ) ).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
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

		it( 'explains generic analysis failures and allows retrying the same address', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockAnalysis( {}, 500 );
			await checkSite();
			expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
				'We couldn’t check your site. Try again.'
			);
			expect( getInput() ).toBeVisible();
			expect( getInput() ).toHaveValue( 'https://example.com' );
			expect( submit ).not.toHaveBeenCalled();

			mockAnalysis( API_RESPONSE_WORDPRESS_PLATFORM );
			mockHost();
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith(
					expect.objectContaining( { from: 'https://example.com', host: 'bluehost' } )
				)
			);
			expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
		} );

		it.each( [
			{ status: 200, body: { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'unreachable' } },
			{ status: 500, body: { code: 'http_request_failed' } },
			{ status: 400, body: { code: 'rest_invalid_param' } },
		] )( 'shows the unreachable outcome for %j', async ( { status, body } ) => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockAnalysis( body, status );
			await checkSite();
			expect(
				await screen.findByRole( 'heading', { name: 'We couldn’t reach your site' } )
			).toBeVisible();
			expect( screen.getByText( 'Couldn’t connect', { selector: 'span' } ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Talk to the team' } ) ).toBeDisabled();
			expect( getInput() ).not.toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'blocks HTTP WordPress sources and continues when retry resolves to HTTPS', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockAnalysis(
				{ ...API_RESPONSE_WORDPRESS_PLATFORM, url: 'http://example.com/', site_health: 'ok' },
				200,
				'http://example.com'
			);
			await checkSite( 'http://example.com' );
			expect(
				await screen.findByRole( 'heading', { name: 'Your site isn’t on HTTPS' } )
			).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
			mockAnalysis(
				{ ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'ok' },
				200,
				'http://example.com'
			);
			mockHost();
			await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( {
					action: 'continue',
					from: 'https://example.com',
					platform: 'wordpress',
					host: 'bluehost',
				} )
			);
		} );

		it( 'does not complete or reopen an outcome when Back cancels a retry', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockAnalysis( { code: 'http_request_failed' }, 500 );
			await checkSite();
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
			mockAnalysis( { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'ok' } );
			mockHost( 500 );
			await checkSite();
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
			mockAnalysis( {
				...API_RESPONSE_WORDPRESS_PLATFORM,
				platform_data: { is_wpcom: true, is_wpengine: false, is_pressable: false },
			} );
			mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
				.reply( 200, { hosting_provider: { slug: 'automattic' } } );
			await checkSite();
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { isWpcom: true } ) )
			);
		} );
	} );

	it.each( [
		{ enabled: false, platform: 'wordpress' },
		{ enabled: true, platform: 'squarespace' },
	] )( 'keeps legacy HTTP continuation for %j', async ( { enabled, platform } ) => {
		jest
			.spyOn( config, 'isEnabled' )
			.mockImplementation( ( flag ) =>
				flag === 'migration/reprint-flow' ? enabled : originalIsEnabled( flag )
			);
		const submit = jest.fn();
		render( { navigation: { submit } } );
		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'http://example.com' } )
			.reply( 200, {
				...API_RESPONSE_WORDPRESS_PLATFORM,
				url: 'http://example.com/',
				platform,
				site_health: enabled ? 'ok' : 'blocked',
			} );
		mockApi()
			.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
			.reply( 200, { hosting_provider: { slug: 'bluehost' } } );
		await userEvent.type( getInput(), 'http://example.com' );
		await userEvent.click(
			screen.getByRole( 'button', { name: enabled ? 'Continue' : 'Check my site' } )
		);
		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith(
				expect.objectContaining( { from: 'http://example.com/', platform } )
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
