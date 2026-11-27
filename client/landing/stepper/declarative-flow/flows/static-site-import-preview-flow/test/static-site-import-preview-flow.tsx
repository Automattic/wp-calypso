/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - the flow test helpers are untyped
import config from '@automattic/calypso-config';
import { waitFor } from '@testing-library/react';
import { select } from '@wordpress/data';
import { MemoryRouter } from 'react-router';
import { type Mock, vi } from 'vitest';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { runFlowNavigation } from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout, goToUnifiedCheckout } from 'calypso/landing/stepper/utils/checkout';
import { startWowFunnelSite } from 'calypso/landing/stepper/utils/wow-funnel-site';
import { loadExperimentAssignment, useExperiment } from 'calypso/lib/explat';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import staticSiteImportPreviewFlow, {
	CHECKOUT_FIRST_EXPERIMENT,
	CHECKOUT_FIRST_VARIATION,
} from '../static-site-import-preview-flow';

vi.mock( 'calypso/landing/stepper/hooks/use-flow-locale' );
vi.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store' );
vi.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: vi.fn(),
	useExperiment: vi.fn(),
} ) );
vi.mock( 'calypso/landing/stepper/utils/checkout' );
vi.mock( 'calypso/state/current-user/selectors' );

const mockCreateSession = vi.hoisted( () => vi.fn() );
vi.mock( '@automattic/api-queries', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/api-queries' ) >(
		'@automattic/api-queries'
	) ),
	createStaticSiteImportSessionMutation: () => ( { mutationFn: mockCreateSession } ),
} ) );

const mockStartSession = vi.hoisted( () => vi.fn() );
vi.mock( '@automattic/api-core', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/api-core' ) >( '@automattic/api-core' ) ),
	createStaticSiteImportSession: mockStartSession,
} ) );
vi.mock( 'calypso/landing/stepper/utils/wow-funnel-site', () => ( {
	startWowFunnelSite: vi.fn(),
} ) );

const originalLocation = window.location;

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( staticSiteImportPreviewFlow, options, 'forward' );

const SOURCE = { from: 'source.example.com', platform: 'wix' };
const IDENTIFIED = { action: 'continue', ...SOURCE, staticSiteImportable: true };

const STARTED = {
	action: 'started',
	importSessionId: 'abc123',
	previewSiteId: 456,
	previewSiteSlug: 'preview.wpcomstaging.com',
	sourceUrl: 'https://source.example.com',
};

const overviewExit = ( source ) => ( {
	path: expect.stringMatching( /\/sites\/preview\.wpcomstaging\.com$/ ),
	query: { ...source, importSessionId: 'abc123', ref: 'static-site-import-preview' },
} );

let flowState: Record< string, unknown >;

const assignVariation = ( variationName: string | null ) => {
	vi.mocked( loadExperimentAssignment ).mockResolvedValue( { variationName } );
	vi.mocked( useExperiment ).mockReturnValue( [ false, { variationName } ] );
};

const PLAN = { cartItems: [ { product_slug: 'personal-bundle' } ] };
const plansPath = '/setup/static-site-import-preview/plans';

const parseUrl = ( url: string ) => {
	const [ path, query = '' ] = url.split( '?' );
	return { path, query: Object.fromEntries( new URLSearchParams( query ) ) };
};

const lastExit = () => {
	const url = String( ( window.location.replace as Mock ).mock.calls.at( -1 )?.[ 0 ] ?? '' );
	const [ path, query = '' ] = url.split( '?' );
	return { path, query: Object.fromEntries( new URLSearchParams( query ) ) };
};

const slugs = ( steps ) => steps.map( ( step ) => step.slug );

describe( 'Static site import preview flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: vi.fn(), replace: vi.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', { value: originalLocation } );
	} );

	beforeEach( () => {
		config.enable( 'migration/non-wordpress-source' );
		window.location.search = '';
		window.location.pathname = '/setup/static-site-import-preview';
		vi.clearAllMocks();
		assignVariation( null );
		vi.mocked( isUserLoggedIn ).mockReturnValue( true );
		vi.mocked( useFlowLocale ).mockReturnValue( 'en' );
		flowState = {};
		mockCreateSession.mockResolvedValue( { session_id: 'abc123', state: 'capture_queued' } );
		vi.mocked( useFlowState ).mockReturnValue( {
			get: ( key ) => flowState[ key ],
			set: vi.fn( ( key, value ) => ( flowState[ key ] = value ) ),
		} );
	} );

	const identify = () => ( flowState[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] = IDENTIFIED );

	describe( 'initialize', () => {
		it( 'asks for the source after login', async () => {
			const steps = await staticSiteImportPreviewFlow.initialize();

			expect( loadExperimentAssignment ).toHaveBeenCalledWith( CHECKOUT_FIRST_EXPERIMENT );
			expect( slugs( steps ) ).toEqual( [
				STEPS.SITE_MIGRATION_IDENTIFY.slug,
				STEPS.CONFIDENCE_STEP.slug,
				STEPS.STATIC_SITE_IMPORT_PROGRESS.slug,
				STEPS.UNIFIED_PLANS.slug,
				STEPS.PROCESSING.slug,
				STEPS.ERROR.slug,
			] );
			expect( steps.every( ( step ) => step.requiresLoggedInUser ) ).toBe( true );
		} );

		it.each( [
			[ 'a', null ],
			[ 'b', CHECKOUT_FIRST_VARIATION ],
		] )( 'stores the variation forced with ?variation=%s for ExPlat', async ( variation, name ) => {
			window.location.search = `?variation=${ variation }`;

			await staticSiteImportPreviewFlow.initialize();

			expect(
				JSON.parse(
					window.localStorage.getItem( `explat-experiment--${ CHECKOUT_FIRST_EXPERIMENT }` )
				)
			).toMatchObject( {
				experimentName: CHECKOUT_FIRST_EXPERIMENT,
				variationName: name,
				ttl: 86400,
			} );
			window.localStorage.clear();
		} );

		it( 'starts at the progress step for a source on the URL', async () => {
			window.location.search = '?from=source.example.com';

			expect( slugs( await staticSiteImportPreviewFlow.initialize() )[ 0 ] ).toBe(
				STEPS.STATIC_SITE_IMPORT_PROGRESS.slug
			);
		} );

		describe( 'in the checkout-first variation', () => {
			beforeEach( () => assignVariation( CHECKOUT_FIRST_VARIATION ) );

			it( 'shows what will move and offers plans before login', async () => {
				const steps = await staticSiteImportPreviewFlow.initialize();

				expect( slugs( steps ) ).toEqual( [
					STEPS.SITE_MIGRATION_IDENTIFY.slug,
					STEPS.CONFIDENCE_STEP.slug,
					STEPS.STATIC_SITE_IMPORT_PROGRESS.slug,
					STEPS.UNIFIED_PLANS.slug,
					STEPS.PROCESSING.slug,
					STEPS.ERROR.slug,
				] );
				expect(
					steps.filter( ( step ) => step.requiresLoggedInUser ).map( ( s ) => s.slug )
				).toEqual( [ STEPS.PROCESSING.slug ] );
			} );

			it( 'starts at the confidence step for a source on the URL', async () => {
				window.location.search = '?from=source.example.com';

				expect( slugs( await staticSiteImportPreviewFlow.initialize() )[ 0 ] ).toBe(
					STEPS.CONFIDENCE_STEP.slug
				);
			} );
		} );

		it( 'stays checkout-first after skipping plans, whatever the assignment', async () => {
			window.location.search = '?skippedPlans=1&from=source.example.com';

			const steps = await staticSiteImportPreviewFlow.initialize();

			expect(
				steps.find( ( step ) => step.slug === STEPS.UNIFIED_PLANS.slug ).requiresLoggedInUser
			).toBeFalsy();
		} );

		it( 'stays checkout-first after leaving checkout, whatever the assignment', async () => {
			window.location.pathname = plansPath;
			window.location.search = '?checkoutExit=1&from=source.example.com';

			const steps = await staticSiteImportPreviewFlow.initialize();

			expect( slugs( steps )[ 0 ] ).toBe( STEPS.CONFIDENCE_STEP.slug );
			expect(
				steps.find( ( step ) => step.slug === STEPS.UNIFIED_PLANS.slug ).requiresLoggedInUser
			).toBeFalsy();
		} );
	} );

	describe( 'progress step props', () => {
		const renderProgressProps = ( url: string ) =>
			renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
				wrapper: ( { children } ) => (
					<MemoryRouter initialEntries={ [ url ] }>{ children }</MemoryRouter>
				),
			} ).result.current[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ];

		it( 'moves the identified source', () => {
			identify();

			expect( renderProgressProps( '/progress' ) ).toEqual( SOURCE );
		} );

		it( 'moves the source on the URL', () => {
			expect( renderProgressProps( '/progress?from=url.example.com' ) ).toEqual( {
				from: 'url.example.com',
				platform: 'unknown',
			} );
		} );

		it( 'picks up the move it started for the same source, on going back', () => {
			identify();
			const started = { ...STARTED, sourceUrl: 'https://source.example.com/' };
			flowState[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ] = started;

			expect( renderProgressProps( '/progress' ) ).toEqual( {
				...SOURCE,
				startedImport: started,
			} );
		} );

		it( 'starts a new move for another source', () => {
			identify();
			flowState[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ] = {
				...STARTED,
				sourceUrl: 'https://other.example.com',
			};

			expect( renderProgressProps( '/progress' ).startedImport ).toBeUndefined();
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
			renderSideEffect( '/identify?from=url.example.com&platform=squarespace' );

			expect( flowState[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] ).toEqual( {
				action: 'continue',
				from: 'url.example.com',
				platform: 'squarespace',
			} );
		} );

		it( 'stores nothing without a source on the URL', () => {
			renderSideEffect( '/identify' );

			expect( flowState ).toEqual( {} );
		} );
	} );

	describe( 'identify step', () => {
		it( 'reads an importable source', () => {
			const destination = runNavigation( {
				from: STEPS.SITE_MIGRATION_IDENTIFY,
				dependencies: IDENTIFIED,
			} );

			expect( destination ).toMatchDestination( { step: STEPS.STATIC_SITE_IMPORT_PROGRESS } );
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

	it( 'offers Skip on plans in the preview-first variation', () => {
		const props = renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
			wrapper: ( { children } ) => (
				<MemoryRouter initialEntries={ [ '/plans' ] }>{ children }</MemoryRouter>
			),
		} ).result.current;

		expect( props[ STEPS.UNIFIED_PLANS.slug ].skippable ).toBe( true );
	} );

	describe( 'progress step', () => {
		const submitProgress = ( dependencies ) =>
			runNavigation( { from: STEPS.STATIC_SITE_IMPORT_PROGRESS, dependencies } );

		it( 'keeps the started move without leaving the step', () => {
			identify();
			const destination = submitProgress( STARTED );

			expect( destination ).toMatchDestination( { step: STEPS.STATIC_SITE_IMPORT_PROGRESS } );
			expect( flowState[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ] ).toEqual( STARTED );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );

		it( 'continues a WordPress source as a migration', () => {
			identify();
			submitProgress( { action: 'migrate' } );

			expect( lastExit() ).toEqual( {
				path: '/setup/site-migration/site-migration-check',
				query: { from: SOURCE.from, platform: 'wordpress', ref: 'static-site-import-preview' },
			} );
		} );

		it( 'offers plans when no preview can be built', () => {
			identify();
			submitProgress( { action: 'preview_failed' } );

			expect( lastExit() ).toEqual( {
				path: '/setup/static-site-import/plans',
				query: { ...SOURCE, ref: 'static-site-import-preview' },
			} );
		} );

		it( 'shows the error step when the import is unavailable', () => {
			const destination = submitProgress( { action: 'unavailable' } );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR } );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );

		describe( 'once the move started', () => {
			beforeEach( () => {
				flowState[ STEPS.STATIC_SITE_IMPORT_PROGRESS.slug ] = STARTED;
			} );

			it( 'offers plans once the move finishes', () => {
				const destination = submitProgress( { action: 'finished' } );

				expect( destination ).toMatchDestination( { step: STEPS.UNIFIED_PLANS } );
				expect( window.location.replace ).not.toHaveBeenCalled();
			} );

			it( 'checks out the plan for the preview, then opens its Overview', () => {
				identify();
				runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN } );

				const { destination, cancelDestination, ...options } =
					vi.mocked( goToCheckout ).mock.calls[ 0 ][ 0 ];
				expect( options ).toEqual( {
					flowName: 'static-site-import-preview',
					stepName: STEPS.UNIFIED_PLANS.slug,
					siteSlug: 'preview.wpcomstaging.com',
					plan: 'personal-bundle',
				} );
				const { query, ...overview } = overviewExit( SOURCE );
				expect( parseUrl( destination ) ).toEqual( {
					...overview,
					query: { ...SOURCE, importSessionId: 'abc123' },
				} );
				expect( query.ref ).toBe( 'static-site-import-preview' );
				expect( cancelDestination ).toBe( '/setup/static-site-import-preview/plans' );
				expect( goToUnifiedCheckout ).not.toHaveBeenCalled();
			} );

			it( 'offers plans with the preview’s share link once the move finishes', () => {
				const destination = submitProgress( {
					action: 'finished',
					previewUrl: 'https://preview.wpcomstaging.com/?share=abc',
				} );

				expect( destination ).toMatchDestination( {
					step: STEPS.UNIFIED_PLANS,
					query: { previewUrl: 'https://preview.wpcomstaging.com/?share=abc' },
				} );
			} );

			it( 'opens the preview’s homepage through its share link when plans are skipped', () => {
				identify();
				runNavigation( {
					from: STEPS.UNIFIED_PLANS,
					dependencies: { action: 'skip_plan' },
					query: { previewUrl: 'https://preview.wpcomstaging.com/?share=abc' },
				} );

				expect( window.location.replace ).toHaveBeenLastCalledWith(
					'https://preview.wpcomstaging.com/?share=abc'
				);
				expect( goToCheckout ).not.toHaveBeenCalled();
			} );

			it( 'opens the preview’s Overview when plans are skipped without a share link', () => {
				identify();
				runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: { action: 'skip_plan' } } );

				expect( lastExit() ).toEqual( overviewExit( SOURCE ) );
				expect( goToCheckout ).not.toHaveBeenCalled();
			} );

			it( 'opens the preview’s Overview for a move that stopped', () => {
				identify();
				submitProgress( { action: 'stopped' } );

				expect( lastExit() ).toEqual( overviewExit( SOURCE ) );
			} );
		} );

		it( 'shows the error step without a started move', () => {
			const destination = submitProgress( { action: 'stopped' } );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR } );
		} );

		it( 'shows the error step for a plan without a started move', () => {
			const destination = runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN } );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR } );
			expect( goToCheckout ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'in the checkout-first variation', () => {
		beforeEach( () => assignVariation( CHECKOUT_FIRST_VARIATION ) );

		it( 'shows what will move for an importable source', () => {
			const destination = runNavigation( {
				from: STEPS.SITE_MIGRATION_IDENTIFY,
				dependencies: IDENTIFIED,
			} );

			expect( destination ).toMatchDestination( { step: STEPS.CONFIDENCE_STEP } );
			expect( flowState[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] ).toEqual( IDENTIFIED );
		} );

		it( 'offers plans from the confidence step', () => {
			const destination = runNavigation( {
				from: STEPS.CONFIDENCE_STEP,
				dependencies: { action: 'continue' },
			} );

			expect( destination ).toMatchDestination( { step: STEPS.UNIFIED_PLANS } );
		} );

		it( 'passes the source to the confidence step', () => {
			identify();
			const props = renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
				wrapper: ( { children } ) => (
					<MemoryRouter initialEntries={ [ '/confidence-step' ] }>{ children }</MemoryRouter>
				),
			} ).result.current;

			expect( props[ STEPS.CONFIDENCE_STEP.slug ] ).toEqual( { from: SOURCE.from } );
		} );

		it( 'offers the paid plans', () => {
			const props = renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
				wrapper: ( { children } ) => (
					<MemoryRouter initialEntries={ [ '/plans' ] }>{ children }</MemoryRouter>
				),
			} ).result.current;

			expect( props[ STEPS.UNIFIED_PLANS.slug ] ).toMatchObject( {
				isInSignup: true,
				intent: 'plans-default-wpcom',
				hideFreePlan: true,
				skippable: true,
			} );
		} );

		it( 'signs up, then processes the move onto a preview, when plans are skipped', async () => {
			identify();
			const destination = runNavigation( {
				from: STEPS.UNIFIED_PLANS,
				dependencies: { action: 'skip_plan' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.PROCESSING,
				query: { ...SOURCE, skippedPlans: '1' },
			} );
			expect( goToUnifiedCheckout ).not.toHaveBeenCalled();

			mockStartSession.mockResolvedValue( { session_id: 'abc123' } );
			vi.mocked( startWowFunnelSite ).mockResolvedValue( {
				blogId: 456,
				siteSlug: 'preview.wpcomstaging.com',
			} );
			await expect( select( ONBOARD_STORE ).getPendingAction()() ).resolves.toEqual( {
				action: 'started',
				importSessionId: 'abc123',
				previewSiteSlug: 'preview.wpcomstaging.com',
			} );
			expect( mockStartSession ).toHaveBeenCalledWith( 'https://source.example.com' );
			expect( startWowFunnelSite ).toHaveBeenCalledWith( {
				funnelSlug: 'preview',
				funnelArgs: { import_session_id: 'abc123' },
			} );
		} );

		it( 'opens the preview’s Overview once processing built it', () => {
			identify();
			runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: {
					processingResult: 'success',
					action: 'started',
					importSessionId: 'abc123',
					previewSiteSlug: 'preview.wpcomstaging.com',
				},
			} );

			expect( lastExit() ).toEqual( overviewExit( SOURCE ) );
		} );

		it( 'offers plans again when processing can’t build a preview', () => {
			const destination = runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: { processingResult: 'success', action: 'preview_failed' },
			} );

			expect( destination ).toMatchDestination( { step: STEPS.UNIFIED_PLANS } );
		} );

		it( 'shows the error step when processing fails', () => {
			const destination = runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: { processingResult: 'failure' },
			} );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR } );
		} );

		it( 'names the source, then checks out a new site that opens on the move', async () => {
			identify();
			vi.mocked( isUserLoggedIn ).mockReturnValue( false );
			runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN } );

			await waitFor( () => expect( goToUnifiedCheckout ).toHaveBeenCalled() );
			expect( mockCreateSession.mock.calls[ 0 ][ 0 ] ).toBe( 'https://source.example.com' );
			const { destination, cancelDestination, ...options } =
				vi.mocked( goToUnifiedCheckout ).mock.calls[ 0 ][ 0 ];
			expect( options ).toEqual( {
				flowName: 'static-site-import-preview',
				plan: 'personal-bundle',
				userIsLoggedIn: false,
				siteIntent: 'site-migration',
			} );
			expect( parseUrl( destination ) ).toEqual( {
				path: expect.stringMatching( /\/sites\/:siteId$/ ),
				query: { ...SOURCE, importSessionId: 'abc123' },
			} );
			expect( parseUrl( cancelDestination ) ).toEqual( {
				path: plansPath,
				query: { ...SOURCE, checkoutExit: '1' },
			} );
		} );

		it( 'continues a source with WordPress behind it as a migration', async () => {
			identify();
			mockCreateSession.mockRejectedValue(
				Object.assign( new Error( 'WordPress' ), {
					status: 400,
					statusCode: 400,
					code: 'static_site_import_source_is_wordpress',
				} )
			);
			runNavigation( { from: STEPS.UNIFIED_PLANS, dependencies: PLAN } );

			await waitFor( () =>
				expect( lastExit() ).toEqual( {
					path: '/setup/site-migration/site-migration-check',
					query: { from: SOURCE.from, platform: 'wordpress', ref: 'static-site-import-preview' },
				} )
			);
			expect( goToUnifiedCheckout ).not.toHaveBeenCalled();
		} );

		it( 'shows an error when no plan is selected', () => {
			const destination = runNavigation( { from: STEPS.UNIFIED_PLANS } );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR, query: null } );
			expect( mockCreateSession ).not.toHaveBeenCalled();
			expect( goToUnifiedCheckout ).not.toHaveBeenCalled();
		} );

		it( 'goes back from plans to the confidence step', () => {
			identify();
			const destination = runFlowNavigation(
				staticSiteImportPreviewFlow,
				{ from: STEPS.UNIFIED_PLANS },
				'back'
			);

			expect( destination ).toMatchDestination( { step: STEPS.CONFIDENCE_STEP } );
		} );

		it( 'goes back from the confidence step to identification', () => {
			identify();
			const destination = runFlowNavigation(
				staticSiteImportPreviewFlow,
				{ from: STEPS.CONFIDENCE_STEP },
				'back'
			);

			expect( destination ).toMatchDestination( { step: STEPS.SITE_MIGRATION_IDENTIFY } );
		} );
	} );
} );
