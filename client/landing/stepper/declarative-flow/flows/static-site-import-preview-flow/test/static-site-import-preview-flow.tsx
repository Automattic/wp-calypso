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
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import staticSiteImportPreviewFlow from '../static-site-import-preview-flow';

jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale' );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store' );

const originalLocation = window.location;

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( staticSiteImportPreviewFlow, options, 'forward' );

const SOURCE = { from: 'source.example.com', platform: 'wix' };
const IDENTIFIED = { action: 'continue', ...SOURCE, staticSiteImportable: true };

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
				STEPS.ERROR.slug,
			] );
			expect( steps.every( ( step ) => step.requiresLoggedInUser ) ).toBe( true );
		} );

		it( 'skips identification for a source on the URL', () => {
			window.location.search = '?from=source.example.com';

			expect( slugs( staticSiteImportPreviewFlow.initialize() ) ).toEqual( [
				STEPS.STATIC_SITE_IMPORT_READING.slug,
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
		it.each( [
			[ 'identified', {}, SOURCE ],
			[ 'named on the URL', { from: SOURCE.from }, { from: SOURCE.from, platform: 'unknown' } ],
		] )( 'opens the preview’s Overview for a source %s', ( name, query, expectedSourceQuery ) => {
			if ( name === 'identified' ) {
				identify();
			}
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: {
					action: 'continue',
					importSessionId: 'abc123',
					previewSiteSlug: 'preview.wpcomstaging.com',
				},
				query,
			} );

			expect( lastExit() ).toMatchObject( {
				path: expect.stringMatching( /\/sites\/preview\.wpcomstaging\.com$/ ),
				query: {
					...expectedSourceQuery,
					importSessionId: 'abc123',
					ref: 'static-site-import-preview',
				},
			} );
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
} );
