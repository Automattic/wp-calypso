/**
 * @jest-environment jsdom
 */
// @ts-nocheck - the flow test helpers are untyped
import config from '@automattic/calypso-config';
import { MemoryRouter } from 'react-router';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { runFlowNavigation } from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import staticSiteImportPreviewFlow from '../static-site-import-preview-flow';

jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale' );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store' );

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
		jest.clearAllMocks();
		jest.mocked( useFlowLocale ).mockReturnValue( 'en' );
		flowState = {};
		jest.mocked( useFlowState ).mockReturnValue( {
			get: ( key ) => flowState[ key ],
			set: jest.fn( ( key, value ) => ( flowState[ key ] = value ) ),
		} );
	} );

	const identify = () => ( flowState[ STEPS.SITE_MIGRATION_IDENTIFY.slug ] = IDENTIFIED );

	describe( 'initialize', () => {
		it( 'asks for the source after login', () => {
			const steps = staticSiteImportPreviewFlow.initialize();

			expect( slugs( steps ) ).toEqual( [
				STEPS.SITE_MIGRATION_IDENTIFY.slug,
				STEPS.STATIC_SITE_IMPORT_READING.slug,
				STEPS.STATIC_SITE_IMPORT_PROGRESS.slug,
				STEPS.STATIC_SITE_IMPORT_READY.slug,
				STEPS.ERROR.slug,
			] );
			expect( steps.every( ( step ) => step.requiresLoggedInUser ) ).toBe( true );
		} );

		it( 'skips identification for a source on the URL', () => {
			window.location.search = '?from=source.example.com';

			expect( slugs( staticSiteImportPreviewFlow.initialize() ) ).toEqual( [
				STEPS.STATIC_SITE_IMPORT_READING.slug,
				STEPS.STATIC_SITE_IMPORT_PROGRESS.slug,
				STEPS.STATIC_SITE_IMPORT_READY.slug,
				STEPS.ERROR.slug,
			] );
		} );
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

		it.each( [
			[ 'with', { action: 'finished', previewUrl: 'https://preview.example/?share=x' } ],
			[ 'without', { action: 'finished' } ],
		] )( 'shows a finished preview %s its share link', ( _name, dependencies ) => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_PROGRESS,
				dependencies,
			} );

			// The URL names the preview too, in case the flow state is dropped on the way.
			expect( destination ).toMatchDestination( {
				step: STEPS.STATIC_SITE_IMPORT_READY,
				query: { previewSiteId: '456', previewSiteSlug: 'preview.wpcomstaging.com' },
			} );
			expect( window.location.replace ).not.toHaveBeenCalled();
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

	describe( 'ready step', () => {
		beforeEach( () => {
			flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ] = STARTED;
		} );

		it( 'passes the preview and its source to the step', () => {
			identify();
			const props = renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
				wrapper: ( { children } ) => (
					<MemoryRouter initialEntries={ [ '/ready' ] }>{ children }</MemoryRouter>
				),
			} ).result.current[ STEPS.STATIC_SITE_IMPORT_READY.slug ];

			expect( props ).toEqual( {
				siteId: 456,
				siteSlug: 'preview.wpcomstaging.com',
				from: SOURCE.from,
			} );
		} );

		it( 'reads the preview from the URL when the flow state has lost it', () => {
			identify();
			delete flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ];
			const props = renderHookWithProvider( () => staticSiteImportPreviewFlow.useStepsProps(), {
				wrapper: ( { children } ) => (
					<MemoryRouter
						initialEntries={ [
							'/ready?previewSiteId=456&previewSiteSlug=preview.wpcomstaging.com',
						] }
					>
						{ children }
					</MemoryRouter>
				),
			} ).result.current[ STEPS.STATIC_SITE_IMPORT_READY.slug ];

			expect( props ).toEqual( {
				siteId: 456,
				siteSlug: 'preview.wpcomstaging.com',
				from: SOURCE.from,
			} );
		} );

		it( 'goes straight to checkout with the Personal plan, coming back to the Overview', () => {
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READY,
				dependencies: { action: 'choose_plan' },
			} );

			const overview = dashboardLink( '/sites/preview.wpcomstaging.com' );
			const [ url ] = jest.mocked( window.location.replace ).mock.calls.at( -1 );
			const [ path, query ] = String( url ).split( '?' );
			expect( path ).toBe( '/checkout/preview.wpcomstaging.com/personal-bundle' );
			expect( Object.fromEntries( new URLSearchParams( query ) ) ).toEqual( {
				redirect_to: overview,
				cancel_to: overview,
				checkoutBackUrl: overview,
				pay_later: '1',
				signup: '1',
			} );
		} );

		it( 'goes to checkout for the preview named on the URL when the flow state has lost it', () => {
			delete flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ];
			window.location.search = '?previewSiteId=456&previewSiteSlug=preview.wpcomstaging.com';
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READY,
				dependencies: { action: 'choose_plan' },
			} );

			const [ url ] = jest.mocked( window.location.replace ).mock.calls.at( -1 );
			expect( String( url ).split( '?' )[ 0 ] ).toBe(
				'/checkout/preview.wpcomstaging.com/personal-bundle'
			);
		} );

		it( 'shows the error step without a started move', () => {
			delete flowState[ STEPS.STATIC_SITE_IMPORT_READING.slug ];
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READY,
				dependencies: { action: 'choose_plan' },
			} );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR } );
		} );
	} );
} );
