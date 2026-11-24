/**
 * @jest-environment jsdom
 */
// @ts-nocheck - the flow test helpers are untyped
import config from '@automattic/calypso-config';
import { MemoryRouter } from 'react-router';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { runFlowNavigation } from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { goToUnifiedCheckout } from 'calypso/landing/stepper/utils/checkout';
import { loadExperimentAssignment, useExperiment } from 'calypso/lib/explat';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import staticSiteImportPreviewFlow, {
	CHECKOUT_FIRST_EXPERIMENT,
	CHECKOUT_FIRST_VARIATION,
} from '../static-site-import-preview-flow';

jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale' );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store' );
jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
	useExperiment: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/utils/checkout' );
jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/state/current-user/selectors' );

const originalLocation = window.location;

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( staticSiteImportPreviewFlow, options, 'forward' );

const SOURCE = { from: 'source.example.com', platform: 'wix' };
const IDENTIFIED = { action: 'continue', ...SOURCE, staticSiteImportable: true };

const STARTED = {
	action: 'continue',
	importSessionId: 'abc123',
	previewSiteId: 456,
	previewSiteSlug: 'preview.wpcomstaging.com',
};

const overviewExit = ( source ) => ( {
	path: expect.stringMatching( /\/sites\/preview\.wpcomstaging\.com$/ ),
	query: { ...source, importSessionId: 'abc123', ref: 'static-site-import-preview' },
} );

let flowState: Record< string, unknown >;

const assignVariation = ( variationName: string | null ) => {
	jest.mocked( loadExperimentAssignment ).mockResolvedValue( { variationName } );
	jest.mocked( useExperiment ).mockReturnValue( [ false, { variationName } ] );
};

const PLAN = { cartItems: [ { product_slug: 'personal-bundle' } ] };
const SITE = { ID: 42, URL: 'https://destination.example.com', plan: { is_free: false } };
const readingPath = '/setup/static-site-import-preview/static-site-import-reading';

const parseUrl = ( url: string ) => {
	const [ path, query = '' ] = url.split( '?' );
	return { path, query: Object.fromEntries( new URLSearchParams( query ) ) };
};

const lastExit = () => {
	const url = String( ( window.location.replace as jest.Mock ).mock.calls.at( -1 )?.[ 0 ] ?? '' );
	const [ path, query = '' ] = url.split( '?' );
	return { path, query: Object.fromEntries( new URLSearchParams( query ) ) };
};

const slugs = ( steps ) => steps.map( ( step ) => step.slug );

describe( 'Static site import preview flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', { value: originalLocation } );
	} );

	beforeEach( () => {
		config.enable( 'migration/non-wordpress-source' );
		window.location.search = '';
		window.location.pathname = '/setup/static-site-import-preview';
		jest.clearAllMocks();
		assignVariation( null );
		jest.mocked( useSite ).mockReturnValue( undefined );
		jest.mocked( isUserLoggedIn ).mockReturnValue( true );
		jest.mocked( useFlowLocale ).mockReturnValue( 'en' );
		flowState = {};
		jest.mocked( useFlowState ).mockReturnValue( {
			get: ( key ) => flowState[ key ],
			set: jest.fn( ( key, value ) => ( flowState[ key ] = value ) ),
		} );
	} );

	const identify = () => ( flowState[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] = IDENTIFIED );

	describe( 'initialize', () => {
		it( 'asks for the source after login', async () => {
			const steps = await staticSiteImportPreviewFlow.initialize();

			expect( loadExperimentAssignment ).toHaveBeenCalledWith( CHECKOUT_FIRST_EXPERIMENT );
			expect( slugs( steps ) ).toEqual( [
				STEPS.SITE_MIGRATION_IDENTIFY.slug,
				STEPS.STATIC_SITE_IMPORT_READING.slug,
				STEPS.STATIC_SITE_IMPORT_PROGRESS.slug,
				STEPS.ERROR.slug,
			] );
			expect( steps.every( ( step ) => step.requiresLoggedInUser ) ).toBe( true );
		} );

		it( 'skips identification for a source on the URL', async () => {
			window.location.search = '?from=source.example.com';

			expect( slugs( await staticSiteImportPreviewFlow.initialize() ) ).toEqual( [
				STEPS.STATIC_SITE_IMPORT_READING.slug,
				STEPS.STATIC_SITE_IMPORT_PROGRESS.slug,
				STEPS.ERROR.slug,
			] );
		} );

		describe( 'in the checkout-first variation', () => {
			beforeEach( () => assignVariation( CHECKOUT_FIRST_VARIATION ) );

			it( 'identifies the source and offers plans before login', async () => {
				const steps = await staticSiteImportPreviewFlow.initialize();

				expect( slugs( steps ) ).toEqual( [
					STEPS.SITE_MIGRATION_IDENTIFY.slug,
					STEPS.UNIFIED_PLANS.slug,
					STEPS.STATIC_SITE_IMPORT_READING.slug,
					STEPS.ERROR.slug,
				] );
				expect(
					steps.filter( ( step ) => step.requiresLoggedInUser ).map( ( s ) => s.slug )
				).toEqual( [ STEPS.STATIC_SITE_IMPORT_READING.slug ] );
			} );

			it( 'skips identification for a source on the URL', async () => {
				window.location.search = '?from=source.example.com';

				expect( slugs( await staticSiteImportPreviewFlow.initialize() ) ).toEqual( [
					STEPS.UNIFIED_PLANS.slug,
					STEPS.STATIC_SITE_IMPORT_READING.slug,
					STEPS.ERROR.slug,
				] );
			} );

			it( 'sends reading to plans until checkout', async () => {
				window.location.pathname = readingPath;
				window.location.search = '?from=source.example.com';

				expect( await staticSiteImportPreviewFlow.initialize() ).toBe( false );
				expect( window.location.replace ).toHaveBeenCalledWith(
					'/setup/static-site-import-preview/plans?from=source.example.com'
				);
			} );
		} );

		it.each( [ '?siteId=42&newSite=1', '?checkoutExit=1' ] )(
			'stays checkout-first back from checkout (%s), whatever the assignment',
			async ( search ) => {
				window.location.pathname = readingPath;
				window.location.search = `${ search }&from=source.example.com`;

				expect( slugs( await staticSiteImportPreviewFlow.initialize() ) ).toEqual( [
					STEPS.UNIFIED_PLANS.slug,
					STEPS.STATIC_SITE_IMPORT_READING.slug,
					STEPS.ERROR.slug,
				] );
			}
		);
	} );

	describe( 'reading step props', () => {
		const renderReadingProps = ( url: string ) =>
			renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
				wrapper: ( { children } ) => (
					<MemoryRouter initialEntries={ [ url ] }>{ children }</MemoryRouter>
				),
			} ).result.current[ STEPS.STATIC_SITE_IMPORT_READING.slug ];

		it( 'builds a preview of the identified source', () => {
			identify();

			expect( renderReadingProps( '/reading' ) ).toEqual( {
				buildPreview: true,
				sourceUrl: SOURCE.from,
			} );
		} );

		it( 'builds a preview of the source on the URL', () => {
			expect( renderReadingProps( '/reading?from=url.example.com' ) ).toEqual( {
				buildPreview: true,
				sourceUrl: 'url.example.com',
			} );
		} );

		it( 'picks up the move it started for the same source, on going back', () => {
			identify();
			const started = { ...STARTED, sourceUrl: 'https://source.example.com/' };
			flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ] = started;

			expect( renderReadingProps( '/reading' ) ).toEqual( {
				buildPreview: true,
				sourceUrl: SOURCE.from,
				startedImport: started,
			} );
		} );

		it( 'starts a new move for another source', () => {
			identify();
			flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ] = {
				...STARTED,
				sourceUrl: 'https://other.example.com',
			};

			expect( renderReadingProps( '/reading' ).startedImport ).toBeUndefined();
		} );
	} );

	describe( 'side effect', () => {
		const renderSideEffect = ( url: string ) =>
			renderHookWithProvider( () => staticSiteImportPreviewFlow.useSideEffect(), {
				wrapper: ( { children } ) => (
					<MemoryRouter initialEntries={ [ url ] }>{ children }</MemoryRouter>
				),
			} );

		it( 'stores the source on the URL in the flow state', () => {
			renderSideEffect( '/reading?from=url.example.com&platform=squarespace' );

			expect( flowState[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] ).toEqual( {
				action: 'continue',
				from: 'url.example.com',
				platform: 'squarespace',
			} );
		} );

		it( 'stores nothing without a source on the URL', () => {
			renderSideEffect( '/reading' );

			expect( flowState ).toEqual( {} );
		} );
	} );

	describe( 'identify step', () => {
		it( 'reads an importable source', () => {
			const destination = runNavigation( {
				from: STEPS.SITE_MIGRATION_IDENTIFY,
				dependencies: IDENTIFIED,
			} );

			expect( destination ).toMatchDestination( { step: STEPS.STATIC_SITE_IMPORT_READING } );
			expect( destination.query.toString() ).toBe( '' );
			expect( flowState[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] ).toEqual( IDENTIFIED );
		} );

		it( 'continues a WordPress source as a migration', () => {
			runNavigation( {
				from: STEPS.SITE_MIGRATION_IDENTIFY,
				dependencies: {
					action: 'continue',
					from: 'wp.example.com',
					platform: 'wordpress',
					host: 'pressable',
				},
			} );

			expect( lastExit() ).toEqual( {
				path: '/setup/site-migration/site-migration-check',
				query: {
					from: 'wp.example.com',
					platform: 'wordpress',
					host: 'pressable',
					ref: 'static-site-import-preview',
				},
			} );
		} );

		it.each( [
			[ 'a source the import cannot take', { action: 'continue', ...SOURCE } ],
			[ 'a skipped identification', { action: 'skip_platform_identification', from: SOURCE.from } ],
		] )( 'hands %s to the migration flow', ( _name, dependencies ) => {
			runNavigation( { from: STEPS.SITE_MIGRATION_IDENTIFY, dependencies } );

			expect( lastExit() ).toEqual( {
				path: '/setup/site-migration/site-migration-identify',
				query: { from: SOURCE.from, ref: 'static-site-import-preview' },
			} );
		} );
	} );

	describe( 'reading step', () => {
		it( 'keeps the started move and shows its progress', () => {
			identify();
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: STARTED,
			} );

			expect( destination ).toMatchDestination( { step: STEPS.STATIC_SITE_IMPORT_PROGRESS } );
			expect( flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ] ).toEqual( STARTED );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );

		it( 'opens the preview’s Overview when the preview’s ID is unknown', () => {
			identify();
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { ...STARTED, previewSiteId: undefined },
			} );

			expect( lastExit() ).toEqual( overviewExit( SOURCE ) );
		} );

		it( 'continues a WordPress source as a migration', () => {
			identify();
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'migrate' },
			} );

			expect( lastExit() ).toEqual( {
				path: '/setup/site-migration/site-migration-check',
				query: { from: SOURCE.from, platform: 'wordpress', ref: 'static-site-import-preview' },
			} );
		} );

		it( 'offers plans when no preview can be built', () => {
			identify();
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'preview_failed' },
			} );

			expect( lastExit() ).toEqual( {
				path: '/setup/static-site-import/plans',
				query: { ...SOURCE, ref: 'static-site-import-preview' },
			} );
		} );

		it.each( [
			[ 'the import is unavailable', { action: 'unavailable' } ],
			[ 'no preview came back', { action: 'continue', importSessionId: 'abc123' } ],
		] )( 'shows the error step when %s', ( _name, dependencies ) => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies,
			} );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR } );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'progress step', () => {
		beforeEach( () => {
			flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ] = STARTED;
		} );

		it( 'passes the started move to the step', () => {
			identify();
			const props = renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
				wrapper: ( { children } ) => (
					<MemoryRouter initialEntries={ [ '/progress' ] }>{ children }</MemoryRouter>
				),
			} ).result.current[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ];

			expect( props ).toEqual( {
				siteId: 456,
				importSessionId: 'abc123',
				...SOURCE,
			} );
		} );

		it( 'passes a saved site ID as a number', () => {
			flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ] = {
				...STARTED,
				previewSiteId: '456',
			} as unknown as typeof STARTED;
			identify();
			const props = renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
				wrapper: ( { children } ) => (
					<MemoryRouter initialEntries={ [ '/progress' ] }>{ children }</MemoryRouter>
				),
			} ).result.current[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ];

			expect( props.siteId ).toBe( 456 );
		} );

		it( 'opens the finished preview at its share link', () => {
			const previewUrl = 'https://preview.example/?share=x';
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_PROGRESS,
				dependencies: { action: 'finished', previewUrl },
			} );

			expect( window.location.replace ).toHaveBeenCalledWith( previewUrl );
		} );

		it( 'opens the preview’s Overview for a finished move without a share link', () => {
			identify();
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_PROGRESS,
				dependencies: { action: 'finished' },
			} );

			expect( lastExit() ).toEqual( overviewExit( SOURCE ) );
		} );

		it( 'opens the preview’s Overview for a move that stopped', () => {
			identify();
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_PROGRESS,
				dependencies: { action: 'stopped' },
			} );

			expect( lastExit() ).toEqual( overviewExit( SOURCE ) );
		} );

		it( 'shows the error step without a started move', () => {
			delete flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ];
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_PROGRESS,
				dependencies: { action: 'stopped' },
			} );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR } );
		} );
	} );
	describe( 'in the checkout-first variation', () => {
		beforeEach( () => assignVariation( CHECKOUT_FIRST_VARIATION ) );

		it( 'offers plans for an importable source', () => {
			const destination = runNavigation( {
				from: STEPS.SITE_MIGRATION_IDENTIFY,
				dependencies: IDENTIFIED,
			} );

			expect( destination ).toMatchDestination( { step: STEPS.UNIFIED_PLANS } );
			expect( flowState[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] ).toEqual( IDENTIFIED );
		} );

		it( 'recommends Personal on the plans step, as static-site-import does', () => {
			const props = renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
				wrapper: ( { children } ) => (
					<MemoryRouter initialEntries={ [ '/plans' ] }>{ children }</MemoryRouter>
				),
			} ).result.current;

			expect( props[ STEPS.UNIFIED_PLANS.slug ] ).toMatchObject( {
				isInSignup: true,
				intent: 'plans-default-wpcom',
				hideFreePlan: true,
			} );
			expect( props[ STEPS.STATIC_SITE_IMPORT_READING.slug ] ).toEqual( {
				buildPreview: false,
			} );
		} );

		it( 'checks out a new site, starting the move on return or a preview on leaving', () => {
			identify();
			jest.mocked( isUserLoggedIn ).mockReturnValue( false );
			runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN } );

			const { destination, cancelDestination, ...options } =
				jest.mocked( goToUnifiedCheckout ).mock.calls[ 0 ][ 0 ];
			expect( options ).toEqual( {
				flowName: 'static-site-import-preview',
				plan: 'personal-bundle',
				userIsLoggedIn: false,
				siteIntent: 'site-migration',
			} );
			expect( destination ).toContain( '&siteId=:siteId' );
			expect( parseUrl( destination ) ).toEqual( {
				path: readingPath,
				query: { ...SOURCE, newSite: '1', siteId: ':siteId' },
			} );
			expect( parseUrl( cancelDestination ) ).toEqual( {
				path: readingPath,
				query: { ...SOURCE, checkoutExit: '1' },
			} );
		} );

		it( 'shows an error when no plan is selected', () => {
			const destination = runNavigation( { from: STEPS.UNIFIED_PLANS } );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR, query: null } );
			expect( goToUnifiedCheckout ).not.toHaveBeenCalled();
		} );

		it( 'opens the new site’s Overview once the move starts', () => {
			jest.mocked( useSite ).mockReturnValue( SITE );
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'continue', importSessionId: 'abc123' },
				query: { ...SOURCE, siteId: '42' },
			} );

			expect( lastExit() ).toEqual( {
				path: expect.stringMatching( /\/sites\/destination\.example\.com$/ ),
				query: { ...SOURCE, importSessionId: 'abc123', ref: 'static-site-import-preview' },
			} );
		} );

		it( 'opens the preview’s Overview for a customer who left checkout', () => {
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: STARTED,
				query: { ...SOURCE, checkoutExit: '1' },
			} );

			expect( lastExit() ).toEqual( overviewExit( SOURCE ) );
		} );

		it( 'returns a customer who left checkout to plans when no preview can be built', () => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'preview_failed' },
				query: { ...SOURCE, checkoutExit: '1' },
			} );

			expect( destination ).toMatchDestination( { step: STEPS.UNIFIED_PLANS } );
		} );

		it( 'continues a WordPress source as a migration into the new site', () => {
			jest.mocked( useSite ).mockReturnValue( SITE );
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'migrate' },
				query: { ...SOURCE, siteId: '42' },
			} );

			expect( lastExit() ).toEqual( {
				path: '/setup/site-migration/site-migration-check',
				query: {
					from: SOURCE.from,
					platform: 'wordpress',
					siteId: '42',
					siteSlug: 'destination.example.com',
					ref: 'static-site-import-preview',
				},
			} );
		} );

		it( 'offers the content importer when the move can’t start', () => {
			jest.mocked( useSite ).mockReturnValue( SITE );
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'unavailable' },
				query: { ...SOURCE, siteId: '42' },
			} );

			expect( lastExit() ).toMatchObject( {
				path: '/setup/site-setup/importerWix',
				query: { from: SOURCE.from, siteSlug: 'destination.example.com' },
			} );
		} );

		it( 'goes back from plans to identification', () => {
			identify();
			const destination = runFlowNavigation(
				staticSiteImportPreviewFlow,
				{ from: STEPS.UNIFIED_PLANS },
				'back'
			);

			expect( destination ).toMatchDestination( { step: STEPS.SITE_MIGRATION_IDENTIFY } );
		} );
	} );
} );
