/**
 * @jest-environment jsdom
 */
import { setImmediate as realSetImmediate } from 'timers';
import config from '@automattic/calypso-config';
import { act, configure, getConfig, screen, waitFor } from '@testing-library/react';
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
	let user: ReturnType< typeof userEvent.setup >;

	const realTick = () => new Promise( ( resolve ) => realSetImmediate( resolve ) );
	const { asyncUtilTimeout, unstable_advanceTimersWrapper: advanceTimers } = getConfig();

	beforeAll( () => {
		nock.disableNetConnect();
		// The Reprint flow keeps each check on screen for a moment, so the clock is faked. nock still
		// answers on real ticks, so let one pass each time waitFor moves the clock.
		configure( {
			asyncUtilTimeout: 3000,
			unstable_advanceTimersWrapper: async ( callback ) => {
				const result = await advanceTimers( callback );
				await realTick();
				return result;
			},
		} );
	} );
	afterAll( () => configure( { asyncUtilTimeout, unstable_advanceTimersWrapper: advanceTimers } ) );
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		jest
			.spyOn( config, 'isEnabled' )
			.mockImplementation(
				( flag ) => flag !== 'migration/reprint-flow' && originalIsEnabled( flag )
			);
	} );
	afterEach( () => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	} );

	it( 'allows retrying failed submissions and restores the form on cached Back', async () => {
		jest.mocked( useSiteSlug ).mockReturnValue( MOCK_WORDPRESS_SITE_SLUG );

		const submit = jest.fn().mockImplementationOnce( () => {
			throw new Error( 'Navigation failed' );
		} );
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

		await user.type( getInput(), 'https://example.com' );

		await user.click( screen.getByRole( 'button', { name: /Check my site/ } ) );

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

		await user.clear( getInput() );
		await user.type( getInput(), 'https://example.com' );
		await user.click( screen.getByRole( 'button', { name: /Check my site/ } ) );
		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 2 ) );
		expect( screen.getByRole( 'heading', { name: 'Scanning your site' } ) ).toBeVisible();

		act( () => window.dispatchEvent( new PageTransitionEvent( 'pageshow', { persisted: true } ) ) );
		expect( getInput() ).toBeVisible();
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

		await user.type( getInput(), 'https://example.com' );

		await user.click( screen.getByRole( 'button', { name: /Check my site/ } ) );

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { platform: 'unknown' } ) )
		);
	} );

	it( 'calls submit with the "skip" action when the user clicks on "choose a content platform"', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await user.click(
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

		await user.type( getInput(), 'https://example.com' );

		await user.click( screen.getByRole( 'button', { name: /Check my site/ } ) );

		await waitFor( () =>
			expect( screen.getByText( /Please enter a valid website / ) ).toBeVisible()
		);
	} );

	it( 'sets the input value to the site url when the "from" param is set', () => {
		const submit = jest.fn();
		render(
			{ navigation: { submit } },
			{ initialEntry: '/some-path?from=existent-site.com&start=true&platform=wordpress' }
		);

		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'existent-site.com' );
		expect( submit ).not.toHaveBeenCalled();
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

		await user.click( screen.getByRole( 'button', { name: /Check my site/ } ) );
		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { platform: 'unknown' } ) )
		);
	} );

	it.each( [ false, true ] )(
		'shows the source placeholder and hosting benefits (reprint: %s)',
		( enabled ) => {
			jest
				.spyOn( config, 'isEnabled' )
				.mockImplementation( ( flag ) =>
					flag === 'migration/reprint-flow' ? enabled : originalIsEnabled( flag )
				);
			const submit = jest.fn();
			render( { navigation: { submit } } );

			expect( getInput() ).toHaveAttribute( 'placeholder', 'your-existing-site.com' );
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
		}
	);

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
			await user.type( getInput(), url );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
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
			expect( screen.getByText( /Why should you host with us/ ) ).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: /Only have a backup file/ } )
			).not.toBeInTheDocument();
			await user.click( screen.getByRole( 'button', { name: /pick your current platform/ } ) );
			expect( submit ).toHaveBeenCalledWith( { action: 'skip_platform_identification' } );
		} );

		it( 'preserves the current address when opening the platform list before checking', async () => {
			const submit = jest.fn();
			render(
				{ navigation: { submit } },
				{ initialEntry: '/some-path?from=https://old.example.com' }
			);
			const platformLink = screen.getByRole( 'button', { name: /pick your current platform/ } );
			await user.click( platformLink );
			expect( submit ).toHaveBeenLastCalledWith( {
				action: 'skip_platform_identification',
				from: 'https://old.example.com',
			} );
			await user.clear( getInput() );
			await user.type( getInput(), 'new.example.com' );
			await user.click( platformLink );
			expect( submit ).toHaveBeenLastCalledWith( {
				action: 'skip_platform_identification',
				from: 'https://new.example.com',
			} );
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
			await user.clear( getInput() );
			await checkSite( 'example.com' );

			expect( screen.getByRole( 'heading', { name: 'Checking your site' } ) ).toBeVisible();
			expect(
				screen.getByRole( 'progressbar', { name: 'Checking your site' } )
			).toBeInTheDocument();
			expect( screen.queryByText( /Why should you host with us/ ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'View site ↗' } ) ).toHaveAttribute(
				'href',
				'https://example.com'
			);
			expect( getInput() ).not.toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
			await waitFor( () => expect( completePlatform ).toEqual( expect.any( Function ) ) );
			await act( async () => completePlatform?.() );
			await waitFor( () =>
				expect( screen.getByRole( 'link', { name: 'WordPress site ↗' } ) ).toBeVisible()
			);
			expect(
				screen.getByRole( 'progressbar', { name: 'Checking your site' } )
			).toBeInTheDocument();
			expect( screen.queryByText( /Why should you host with us/ ) ).not.toBeInTheDocument();
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

		it( 'checks a handed-over address right away', async () => {
			const submit = jest.fn();
			mockAnalysis( API_RESPONSE_WORDPRESS_PLATFORM );
			mockHost();
			renderStep(
				<SiteMigrationIdentify { ...mockStepProps( { navigation: { submit } } ) } checkOnArrival />,
				{ initialEntry: '/some-path?from=https://example.com&start=true&platform=wordpress' }
			);

			expect( screen.getByRole( 'heading', { name: 'Checking your site' } ) ).toBeVisible();
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( {
					action: 'continue',
					from: 'https://example.com',
					platform: 'wordpress',
					host: 'bluehost',
				} )
			);
		} );

		it( 'leaves a handed-over address in the form unless the flow asks for a check', () => {
			const submit = jest.fn();
			render(
				{ navigation: { submit } },
				{ initialEntry: '/some-path?from=https://example.com&start=true&platform=wordpress' }
			);

			expect( screen.getByRole( 'heading', { name: "Let's find your site" } ) ).toBeVisible();
			expect( getInput() ).toHaveValue( 'https://example.com' );
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'keeps a quick check on screen for a moment before its outcome', async () => {
			const submit = jest.fn();
			const url = 'https://quick.example.com';
			const analysis = mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: url } )
				.reply( 200, { ...API_RESPONSE_WORDPRESS_PLATFORM, url } );
			const host = mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/quick.example.com' )
				.reply( 200, { hosting_provider: { slug: 'bluehost' } } );
			render( { navigation: { submit } } );

			await checkSite( url );
			// Let both answers arrive without moving the clock, however long the machine takes.
			while ( ! ( analysis.isDone() && host.isDone() ) ) {
				await act( async () => {
					jest.advanceTimersByTime( 0 );
					await realTick();
				} );
			}
			// Then move the clock up to just short of the hold in small steps, with real ticks for the answers to land.
			for ( let elapsed = 0; elapsed < 1400; elapsed += 50 ) {
				await act( async () => {
					jest.advanceTimersByTime( 50 );
					for ( let tick = 0; tick < 10; tick++ ) {
						await realTick();
					}
				} );
			}

			expect( screen.getByRole( 'heading', { name: 'Checking your site' } ) ).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();

			await act( async () => jest.advanceTimersByTime( 100 ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { from: url } ) )
			);
		} );

		it( 'shows the form for an invalid landing page address', () => {
			const submit = jest.fn();
			renderStep(
				<SiteMigrationIdentify { ...mockStepProps( { navigation: { submit } } ) } checkOnArrival />,
				{ initialEntry: '/some-path?from=not%20a%20url&start=true' }
			);

			expect( screen.getByRole( 'heading', { name: "Let's find your site" } ) ).toBeVisible();
			expect( getInput() ).toHaveValue( 'not a url' );
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'explains generic analysis failures and allows retrying the same address', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } }, { initialEntry: '/some-path?hide_importer_link=true' } );
			mockAnalysis( {}, 500 );
			await checkSite();
			expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
				'We couldn’t check your site. Try again.'
			);
			expect( screen.getByRole( 'button', { name: /pick your current platform/ } ) ).toBeVisible();
			expect( getInput() ).toBeVisible();
			expect( getInput() ).toHaveValue( 'https://example.com' );
			expect( submit ).not.toHaveBeenCalled();

			mockAnalysis( API_RESPONSE_WORDPRESS_PLATFORM );
			mockHost();
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith(
					expect.objectContaining( { from: 'https://example.com', host: 'bluehost' } )
				)
			);
			expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
		} );

		it.each( [
			{ status: 200, body: { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'unreachable' } },
			{ status: 200, body: { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'blocked' } },
			{ status: 200, body: { ...API_RESPONSE_WITH_OTHER_PLATFORM, site_health: 'blocked' } },
			{ status: 200, body: { ...API_RESPONSE_WITH_OTHER_PLATFORM, site_health: 'not_found' } },
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
			expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toBeEnabled();
			expect( screen.getByRole( 'button', { name: /pick your current platform/ } ) ).toBeEnabled();
			expect( getInput() ).not.toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'continues a WordPress source whose homepage is a 404', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockAnalysis( { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'not_found' } );
			mockHost();
			await checkSite();
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith(
					expect.objectContaining( { from: 'https://example.com', platform: 'wordpress' } )
				)
			);
		} );

		it( 'continues HTTP WordPress sources, since the migration can reach them without TLS', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockAnalysis(
				{ ...API_RESPONSE_WORDPRESS_PLATFORM, url: 'http://example.com/', site_health: 'ok' },
				200,
				'http://example.com'
			);
			mockHost();
			await checkSite( 'http://example.com' );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( {
					action: 'continue',
					from: 'http://example.com/',
					platform: 'wordpress',
					host: 'bluehost',
				} )
			);
		} );

		it( 'retains the failed address when opening the platform list', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockAnalysis( { code: 'http_request_failed' }, 500, 'example.com' );
			await checkSite( 'example.com' );
			await screen.findByRole( 'heading', { name: 'We couldn’t reach your site' } );
			expect( submit ).not.toHaveBeenCalled();
			await user.click( screen.getByRole( 'button', { name: /pick your current platform/ } ) );
			expect( submit ).toHaveBeenCalledTimes( 1 );
			expect( submit ).toHaveBeenCalledWith( {
				action: 'skip_platform_identification',
				from: 'https://example.com',
			} );
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
			await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );
			await screen.findByRole( 'heading', { name: 'Checking your site' } );
			await waitFor( () => expect( completeRetry ).toEqual( expect.any( Function ) ) );
			await user.click( screen.getByRole( 'button', { name: 'Back' } ) );
			await act( async () => completeRetry?.() );
			expect( getInput() ).toBeVisible();
			expect( getInput() ).toHaveValue( 'https://example.com' );
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'continues without the hosting provider when its lookup takes too long', async () => {
			const submit = jest.fn();
			render( { navigation: { submit } } );
			mockAnalysis( { ...API_RESPONSE_WORDPRESS_PLATFORM, site_health: 'ok' } );
			// Never answers.
			const host = mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
				.reply( 200, () => new Promise( () => {} ) );
			await checkSite();
			await waitFor( () => expect( host.isDone() ).toBe( true ) );
			expect( submit ).not.toHaveBeenCalled();

			await act( async () => jest.advanceTimersByTime( 5000 ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith(
					expect.objectContaining( { from: 'https://example.com', host: undefined } )
				)
			);
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
				site_health: 'blocked',
			} );
		mockApi()
			.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
			.reply( 200, { hosting_provider: { slug: 'bluehost' } } );
		await user.type( getInput(), 'http://example.com' );
		await user.click(
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
