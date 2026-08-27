/**
 * @jest-environment jsdom
 */
import {
	waitForAtomicTransferComplete,
	waitForBlueprintImportComplete,
} from '../blueprint-archive-import';
import {
	clearWowFunnelSite,
	getRememberedWowFunnelSite,
	getWowFunnelConfig,
	getWowFunnelDest,
	getWowFunnelKey,
	isKnownWowFunnel,
	waitForWowFunnelReady,
	wowFunnelSiteIsPaid,
} from '../wow-funnel';

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( '../blueprint-archive-import', () => ( {
	__esModule: true,
	waitForAtomicTransferComplete: jest.fn( () => Promise.resolve() ),
	waitForBlueprintImportComplete: jest.fn( () => Promise.resolve() ),
	getSiteAdminUrl: jest.fn(),
	getSiteEditorUrl: jest.fn(),
} ) );

const mockTransferWait = waitForAtomicTransferComplete as jest.Mock;
const mockImportWait = waitForBlueprintImportComplete as jest.Mock;

const never = () => new Promise< void >( () => {} );

const SESSION_KEY = 'wow-funnel-created-site';

function remember( funnelSlug: string, funnelArgs: Record< string, string >, blogId: number ) {
	window.sessionStorage.setItem(
		SESSION_KEY,
		JSON.stringify( {
			funnelSlug,
			funnelKey: getWowFunnelKey( funnelSlug, funnelArgs ),
			blogId,
			siteSlug: `site-${ blogId }.wordpress.com`,
		} )
	);
}

describe( 'getWowFunnelKey', () => {
	it( 'separates runs that build different things', () => {
		expect( getWowFunnelKey( 'blueprint', { blueprint_slug: 'coachava' } ) ).not.toBe(
			getWowFunnelKey( 'blueprint', { blueprint_slug: 'other' } )
		);
	} );

	it( 'is stable regardless of arg order', () => {
		expect( getWowFunnelKey( 'blueprint', { a: '1', b: '2' } ) ).toBe(
			getWowFunnelKey( 'blueprint', { b: '2', a: '1' } )
		);
	} );
} );

describe( 'getRememberedWowFunnelSite', () => {
	beforeEach( () => {
		window.sessionStorage.clear();
	} );

	it( 'resumes the site when the same CTA is re-entered', () => {
		remember( 'blueprint', { blueprint_slug: 'coachava' }, 111 );

		expect(
			getRememberedWowFunnelSite( 'blueprint', { blueprint_slug: 'coachava' } )?.blogId
		).toBe( 111 );
	} );

	/**
	 * Two theme CTAs share the funnel slug and differ only in the blueprint. Matching on the slug
	 * alone sent the customer back to a site built from the theme they did not pick.
	 */
	it( 'does not resume a site built from a different blueprint', () => {
		remember( 'blueprint', { blueprint_slug: 'coachava' }, 111 );

		expect( getRememberedWowFunnelSite( 'blueprint', { blueprint_slug: 'other' } ) ).toBeNull();
	} );

	it( 'forgets the site once the run is cleared', () => {
		remember( 'blueprint', { blueprint_slug: 'coachava' }, 111 );
		clearWowFunnelSite();

		expect( getRememberedWowFunnelSite( 'blueprint', { blueprint_slug: 'coachava' } ) ).toBeNull();
	} );

	it( 'ignores a remembered site written before funnelKey existed', () => {
		window.sessionStorage.setItem(
			SESSION_KEY,
			JSON.stringify( { funnelSlug: 'blueprint', blogId: 111, siteSlug: 'old.wordpress.com' } )
		);

		expect( getRememberedWowFunnelSite( 'blueprint', { blueprint_slug: 'coachava' } ) ).toBeNull();
	} );
} );

describe( 'wowFunnelSiteIsPaid', () => {
	/**
	 * The funnel exists to sell a plan for the site it builds. Resuming a site that already has
	 * one puts a second plan in the cart for a site that does not need it.
	 */
	it( 'is true for a site holding a paid plan', () => {
		expect( wowFunnelSiteIsPaid( { plan: { is_free: false } } ) ).toBe( true );
	} );

	it( 'is false for a free site', () => {
		expect( wowFunnelSiteIsPaid( { plan: { is_free: true } } ) ).toBe( false );
	} );

	it( 'is false when the site or its plan is unknown', () => {
		expect( wowFunnelSiteIsPaid( undefined ) ).toBe( false );
		expect( wowFunnelSiteIsPaid( {} ) ).toBe( false );
	} );
} );

describe( 'isKnownWowFunnel', () => {
	it( 'recognizes the registered funnels', () => {
		expect( isKnownWowFunnel( 'default' ) ).toBe( true );
		expect( isKnownWowFunnel( 'blueprint' ) ).toBe( true );
	} );

	it( 'rejects an unregistered slug, so it degrades to ordinary onboarding', () => {
		// The server ignores an unknown slug and never starts a build; taking the funnel path
		// here would strand the customer on the loading screen waiting for nothing.
		expect( isKnownWowFunnel( 'not-a-funnel' ) ).toBe( false );
		expect( isKnownWowFunnel( '' ) ).toBe( false );
		expect( isKnownWowFunnel( null ) ).toBe( false );
	} );

	it( 'is not fooled by inherited Object properties', () => {
		expect( isKnownWowFunnel( 'constructor' ) ).toBe( false );
		expect( isKnownWowFunnel( 'toString' ) ).toBe( false );
	} );
} );

describe( 'getWowFunnelConfig', () => {
	it( 'gives an unconfigured funnel the defaults: no interstitials, editor, transfer', () => {
		const config = getWowFunnelConfig( 'default' );
		expect( config.interstitials ).toEqual( [] );
		expect( config.dest ).toBe( 'editor' );
		expect( config.readiness ).toBe( 'transfer' );
	} );

	it( 'applies per-funnel overrides over the defaults', () => {
		const config = getWowFunnelConfig( 'blueprint' );
		expect( config.interstitials ).toEqual( [ 'site-spec' ] );
		expect( config.readiness ).toBe( 'import' );
		// Not overridden, so it still comes from the defaults.
		expect( config.dest ).toBe( 'editor' );
	} );
} );

describe( 'getWowFunnelDest', () => {
	it( "defaults to the funnel's destination when the CTA asks for nothing", () => {
		expect( getWowFunnelDest( new URLSearchParams(), 'default' ) ).toBe( 'editor' );
	} );

	it( 'lets a recognized dest override the default', () => {
		expect( getWowFunnelDest( new URLSearchParams( 'dest=editor' ), 'default' ) ).toBe( 'editor' );
	} );

	it( 'falls back to the default rather than returning null for an unrecognized dest', () => {
		// A missing or bogus dest used to drop the customer into ordinary onboarding
		// destinations, which looked like working onboarding and was not.
		expect( getWowFunnelDest( new URLSearchParams( 'dest=nowhere' ), 'blueprint' ) ).toBe(
			'editor'
		);
	} );
} );

describe( 'waitForWowFunnelReady', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockTransferWait.mockImplementation( () => Promise.resolve() );
		mockImportWait.mockImplementation( () => Promise.resolve() );
	} );

	it( 'waits only on the transfer for a transfer-readiness funnel', async () => {
		await waitForWowFunnelReady( { funnelSlug: 'default', siteIdentifier: 'site.example.com' } );

		expect( mockTransferWait ).toHaveBeenCalledWith( 'site.example.com' );
		expect( mockImportWait ).not.toHaveBeenCalled();
	} );

	it( 'waits on the transfer and then the import for an import-readiness funnel', async () => {
		await waitForWowFunnelReady( { funnelSlug: 'blueprint', siteIdentifier: 'site.example.com' } );

		expect( mockTransferWait ).toHaveBeenCalledWith( 'site.example.com' );
		expect( mockImportWait ).toHaveBeenCalledWith( 'site.example.com' );
	} );

	it( 'throws when the build fails, so the flow routes to the error step', async () => {
		mockTransferWait.mockImplementation( () =>
			Promise.reject( new Error( 'Atomic transfer failed with status: reverted' ) )
		);

		await expect(
			waitForWowFunnelReady( { funnelSlug: 'default', siteIdentifier: 'site.example.com' } )
		).rejects.toThrow( /went wrong/i );
	} );

	it( 'throws a timeout once the funnel budget is spent, without hanging on the build', async () => {
		jest.useFakeTimers();
		// A build that never settles: only the timeout can end this wait.
		mockTransferWait.mockImplementation( never );

		const pending = waitForWowFunnelReady( {
			funnelSlug: 'default',
			siteIdentifier: 'site.example.com',
		} );
		const assertion = expect( pending ).rejects.toThrow( /taking longer than expected/i );

		// The default funnel's budget is 180s.
		await jest.advanceTimersByTimeAsync( 180 * 1000 );
		await assertion;

		jest.useRealTimers();
	} );

	it( 'does not raise an unhandled rejection when the build fails after a timeout', async () => {
		jest.useFakeTimers();
		let failBuild: ( error: Error ) => void = () => {};
		mockTransferWait.mockImplementation(
			() => new Promise< void >( ( _resolve, reject ) => ( failBuild = reject ) )
		);

		const pending = waitForWowFunnelReady( {
			funnelSlug: 'default',
			siteIdentifier: 'site.example.com',
		} );
		const assertion = expect( pending ).rejects.toThrow( /taking longer than expected/i );

		await jest.advanceTimersByTimeAsync( 180 * 1000 );
		await assertion;

		// The abandoned build settles late. It must be swallowed: the wait already reported a
		// timeout, and an unhandled rejection here would surface as a spurious flow exception.
		failBuild( new Error( 'Atomic transfer failed with status: error' ) );
		await Promise.resolve();

		jest.useRealTimers();
	} );
} );
