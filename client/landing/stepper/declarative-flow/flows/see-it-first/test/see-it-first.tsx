/**
 * @jest-environment jsdom
 */
// @ts-nocheck - the flow test helpers are untyped
import config from '@automattic/calypso-config';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { requestLongScreenshot } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/see-it-first-preview/screenshot';
import { runFlowNavigation } from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { goToUnifiedCheckout } from 'calypso/landing/stepper/utils/checkout';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import seeItFirstFlow from '../see-it-first';

const originalLocation = window.location;

jest.mock( 'calypso/landing/stepper/utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale' );
jest.mock( 'calypso/landing/stepper/hooks/use-site-data' );
jest.mock(
	'calypso/landing/stepper/declarative-flow/internals/steps-repository/see-it-first-preview/screenshot'
);

const SOURCE = { from: 'https://source.example.com', platform: 'wix' };
const previewPath = '/setup/see-it-first/see-it-first-preview';
const readingPath = '/setup/see-it-first/static-site-import-reading';

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( seeItFirstFlow, options, 'forward' );

const parseUrl = ( url: string ) => {
	const [ path, query = '' ] = url.split( '?' );
	return { path, query: Object.fromEntries( new URLSearchParams( query ) ) };
};

const lastExit = () =>
	parseUrl( String( jest.mocked( window.location.replace ).mock.calls.at( -1 )?.[ 0 ] ?? '' ) );

describe( 'See it first flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', { value: originalLocation } );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		config.enable( 'migration/non-wordpress-source' );
		jest.mocked( isCurrentUserLoggedIn ).mockReturnValue( true );
		jest.mocked( isUserLoggedIn ).mockReturnValue( true );
		jest.mocked( useFlowLocale ).mockReturnValue( 'en' );
		jest.mocked( useSiteData ).mockReturnValue( { siteId: 0, siteSlug: '' } );
	} );

	describe( 'identify', () => {
		it( 'shows the preview for a source we can import', () => {
			const destination = runNavigation( {
				from: STEPS.SITE_MIGRATION_IDENTIFY,
				dependencies: {
					action: 'continue',
					from: 'https://source.example.com',
					platform: 'squarespace',
					staticSiteImportable: true,
				},
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SEE_IT_FIRST_PREVIEW,
				query: { from: 'https://source.example.com', platform: 'squarespace' },
			} );
			// Signing in gives mShots time to capture it.
			expect( requestLongScreenshot ).toHaveBeenCalledWith( 'https://source.example.com' );
		} );

		it( 'sends any other source to the migration flow with its address', () => {
			runNavigation( {
				from: STEPS.SITE_MIGRATION_IDENTIFY,
				dependencies: { action: 'continue', from: 'https://wp.example.com', platform: 'wordpress' },
			} );

			expect( lastExit() ).toEqual( {
				path: '/setup/site-migration/site-migration-identify',
				query: { ref: 'see-it-first', from: 'https://wp.example.com', start: 'true' },
			} );
		} );
	} );

	describe( 'preview', () => {
		it( 'sends a kept site to checkout for the Personal plan, which then starts the move', () => {
			runNavigation( {
				from: STEPS.SEE_IT_FIRST_PREVIEW,
				dependencies: { action: 'keep' },
				query: SOURCE,
			} );

			const { destination, cancelDestination, ...options } =
				jest.mocked( goToUnifiedCheckout ).mock.calls[ 0 ][ 0 ];
			expect( options ).toEqual( {
				flowName: 'see-it-first',
				plan: 'personal-bundle',
				userIsLoggedIn: true,
				siteIntent: 'site-migration',
			} );
			expect( destination ).toContain( '&siteId=:siteId' );
			expect( parseUrl( destination ) ).toEqual( {
				path: readingPath,
				query: { ...SOURCE, newSite: '1', siteId: ':siteId' },
			} );
			expect( parseUrl( cancelDestination ) ).toEqual( { path: previewPath, query: SOURCE } );
		} );

		it( 'asks for an address again when the preview has none', () => {
			const destination = runNavigation( {
				from: STEPS.SEE_IT_FIRST_PREVIEW,
				dependencies: { action: 'unavailable' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SITE_MIGRATION_IDENTIFY,
				query: null,
			} );
		} );
	} );

	describe( 'after checkout', () => {
		beforeEach( () => {
			jest.mocked( useSiteData ).mockReturnValue( { siteId: 42, siteSlug: 'new.wordpress.com' } );
		} );

		it( 'opens the new site’s Overview, which tracks the move', () => {
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'continue', importSessionId: 'abc123' },
				query: { ...SOURCE, siteId: '42' },
			} );

			const { path, query } = lastExit();
			expect( path ).toMatch( /\/sites\/new\.wordpress\.com$/ );
			expect( query ).toEqual( { ref: 'see-it-first', importSessionId: 'abc123', ...SOURCE } );
		} );

		it( 'migrates a WordPress source into the new site', () => {
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'migrate' },
				query: { ...SOURCE, siteId: '42' },
			} );

			expect( lastExit() ).toEqual( {
				path: '/setup/site-migration/site-migration-check',
				query: {
					ref: 'see-it-first',
					from: SOURCE.from,
					platform: 'wordpress',
					siteId: '42',
					siteSlug: 'new.wordpress.com',
				},
			} );
		} );

		it( 'falls back to the platform importer when the import can’t start', () => {
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'unavailable' },
				query: { ...SOURCE, siteId: '42' },
			} );

			const { path, query } = lastExit();
			expect( path ).toBe( '/setup/site-setup/importerWix' );
			expect( query ).toMatchObject( { siteSlug: 'new.wordpress.com', from: SOURCE.from } );
		} );
	} );
} );
