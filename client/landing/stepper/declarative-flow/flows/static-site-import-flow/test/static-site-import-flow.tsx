/**
 * @jest-environment jsdom
 */
// @ts-nocheck - the flow test helpers are untyped
import config from '@automattic/calypso-config';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	renderFlow,
	runFlowNavigation,
} from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import staticSiteImportFlow from '../static-site-import-flow';

const originalLocation = window.location;

jest.mock( 'calypso/landing/stepper/utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-admin' );
jest.mock( 'calypso/landing/stepper/hooks/use-record-signup-complete', () => ( {
	useRecordSignupComplete: jest.fn().mockReturnValue( jest.fn() ),
} ) );

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( staticSiteImportFlow, options, 'forward' );

const SOURCE = { from: 'busybearscleaning.com', platform: 'wix' };
const SESSION = { ...SOURCE, importSessionId: 'abc123' };
const SITE = { siteId: 42, siteSlug: 'busybears.wordpress.com' };

const lastExit = () => {
	const calls = [
		...( window.location.assign as jest.Mock ).mock.calls,
		...( window.location.replace as jest.Mock ).mock.calls,
	];
	const [ path, query = '' ] = String( calls.at( -1 )?.[ 0 ] ?? '' ).split( '?' );
	return { path, query: Object.fromEntries( new URLSearchParams( query ) ) };
};

describe( 'Static site import flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		config.enable( 'migration/non-wordpress-source' );
		window.location.search = '';
		( window.location.assign as jest.Mock ).mockClear();
		( window.location.replace as jest.Mock ).mockClear();
		( goToCheckout as jest.Mock ).mockClear();
		( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
		jest.mocked( getCurrentUserSiteCount ).mockReturnValue( 0 );
		jest.mocked( useSite ).mockReturnValue( undefined );
		jest.mocked( useIsSiteAdmin ).mockReturnValue( { isAdmin: true, isFetching: false } );
	} );

	it( 'sends users who cannot manage the destination site to the start page', () => {
		jest.mocked( useIsSiteAdmin ).mockReturnValue( { isAdmin: false, isFetching: false } );

		renderFlow( staticSiteImportFlow ).runUseAssertionCondition( {
			currentStep: STEPS.STATIC_SITE_IMPORT_READY.slug,
		} );

		expect( window.location.assign ).toHaveBeenCalledWith( '/start' );
	} );

	describe( 'initialize', () => {
		const identifyPath = '/setup/site-migration/site-migration-identify';

		it( 'runs for a non-WordPress source', () => {
			window.location.search = '?from=busybearscleaning.com&platform=wix';

			expect( staticSiteImportFlow.initialize() ).not.toBe( false );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );

		it( 'sends everything else to the migration flow to be identified', () => {
			window.location.search = '?from=example.com&platform=wordpress&siteId=42';

			expect( staticSiteImportFlow.initialize() ).toBe( false );
			expect( window.location.replace ).toHaveBeenCalledWith(
				`${ identifyPath }?from=example.com&platform=wordpress&siteId=42`
			);
		} );

		it( 'sends every source there when the flag is off', () => {
			config.disable( 'migration/non-wordpress-source' );
			window.location.search = '?from=busybearscleaning.com&platform=wix';

			expect( staticSiteImportFlow.initialize() ).toBe( false );
			expect( window.location.replace ).toHaveBeenCalledWith(
				`${ identifyPath }?from=busybearscleaning.com&platform=wix`
			);
		} );
	} );

	describe( 'reading', () => {
		it( 'records the new session in the URL', () => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'session-created', importSessionId: 'abc123' },
				query: { ...SOURCE, importSessionId: '' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.STATIC_SITE_IMPORT_READING,
				query: { importSessionId: 'abc123' },
			} );
		} );

		it( 'shows the results once the site is read', () => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'continue', importSessionId: 'abc123' },
				query: SOURCE,
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.STATIC_SITE_IMPORT_RESULTS,
				query: { importSessionId: 'abc123' },
			} );
		} );

		it( 'falls back to the content importer when the site cannot be read', () => {
			jest.mocked( getCurrentUserSiteCount ).mockReturnValue( 3 );

			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'unavailable', reason: 'static_site_import_disabled' },
				query: SOURCE,
			} );

			expect( lastExit() ).toMatchObject( {
				path: '/setup/site-migration/sitePicker',
				query: SOURCE,
			} );
		} );

		it( 'goes straight to the importer for an existing site', () => {
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READING,
				dependencies: { action: 'unavailable' },
				query: { ...SOURCE, ...SITE },
			} );

			expect( lastExit().path ).toBe( '/setup/site-setup/importerWix' );
		} );
	} );

	describe( 'choosing an address and plan', () => {
		it( 'asks for an address when there is no site yet', () => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_HOW_IT_WORKS,
				query: SESSION,
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.STATIC_SITE_IMPORT_ADDRESS,
				query: null,
			} );
		} );

		it( 'skips to the move for a site already on a paid plan', () => {
			jest.mocked( useSite ).mockReturnValue( {
				ID: 42,
				URL: 'https://busybears.wordpress.com',
				plan: { is_free: false },
			} );

			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_HOW_IT_WORKS,
				query: { ...SESSION, ...SITE },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.STATIC_SITE_IMPORT_READY,
				query: null,
			} );
		} );

		it.each( [
			[ 'keep', STEPS.UNIFIED_PLANS ],
			[ 'free', STEPS.UNIFIED_PLANS ],
			[ 'register', STEPS.DOMAIN_SEARCH ],
		] )( 'routes the %s address choice', ( domainChoice, step ) => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_ADDRESS,
				dependencies: { domainChoice },
				query: SESSION,
			} );

			expect( destination ).toMatchDestination( { step, query: { domainChoice } } );
		} );

		it( 'sends the new site to checkout with everything the move needs afterwards', () => {
			runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: { siteCreated: true, goToCheckout: true, ...SITE },
				query: { ...SESSION, domainChoice: 'keep' },
			} );

			const { destination, siteSlug, plan } = jest.mocked( goToCheckout ).mock.calls[ 0 ][ 0 ];
			const [ path, query ] = destination.split( '?' );

			expect( siteSlug ).toBe( SITE.siteSlug );
			expect( plan ).toBeUndefined();
			expect( path ).toBe( '/setup/static-site-import/static-site-import-ready' );
			expect( Object.fromEntries( new URLSearchParams( query ) ) ).toEqual( {
				...SESSION,
				siteId: '42',
				siteSlug: SITE.siteSlug,
				domainChoice: 'keep',
			} );
		} );

		it( 'adds the plan to checkout for an existing site', () => {
			runNavigation( {
				from: STEPS.UNIFIED_PLANS,
				dependencies: { cartItems: [ { product_slug: 'business-bundle' } ] },
				query: { ...SESSION, ...SITE },
			} );

			expect( jest.mocked( goToCheckout ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
				siteSlug: SITE.siteSlug,
				plan: 'business-bundle',
			} );
		} );
	} );

	describe( 'after checkout', () => {
		it( 'builds the site once the move is approved', () => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READY,
				dependencies: { action: 'approved' },
				query: { ...SESSION, ...SITE },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.STATIC_SITE_IMPORT_BUILDING,
				query: null,
			} );
		} );

		it( 'reads the site again when the preview has expired', () => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_READY,
				dependencies: { action: 'restart' },
				query: { ...SESSION, ...SITE },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.STATIC_SITE_IMPORT_READING,
				query: { importSessionId: '' },
			} );
		} );

		it( 'connects the kept domain from the done screen', () => {
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_DONE,
				dependencies: { action: 'connect-domain' },
				query: { ...SESSION, ...SITE, domainChoice: 'keep' },
			} );

			expect( lastExit() ).toMatchObject( {
				path: `/domains/add/use-my-domain/${ SITE.siteSlug }`,
				query: { initialQuery: 'busybearscleaning.com' },
			} );
		} );

		it( 'hands a reported problem to a migration expert', () => {
			const destination = runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_DONE,
				dependencies: { action: 'reported' },
				query: { ...SESSION, ...SITE },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.STATIC_SITE_IMPORT_EXPERT,
				query: null,
			} );
		} );

		it( 'offers the content importer when the move never finished', () => {
			runNavigation( {
				from: STEPS.STATIC_SITE_IMPORT_EXPERT,
				dependencies: { action: 'continue-alone', finished: false },
				query: { ...SESSION, ...SITE },
			} );

			expect( lastExit().path ).toBe( '/setup/site-setup/importerWix' );
		} );
	} );
} );
