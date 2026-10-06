/**
 * @jest-environment jsdom
 */
import wpcom from 'calypso/lib/wp';
import {
	getSiteAdminUrl,
	getSiteEditorUrl,
	waitForAtomicTransferComplete,
	waitForBlueprintImportComplete,
} from '../blueprint-archive-import';
import {
	clearWowFunnelSite,
	getRememberedWowFunnelSite,
	getWowFunnelArgs,
	getWowFunnelConfig,
	getWowFunnelDest,
	getWowFunnelEntryQueryArgs,
	getWowFunnelHandoffUrl,
	getWowFunnelKey,
	getWowFunnelSlug,
	isKnownWowFunnel,
	isSameWowFunnelRun,
	isWowFunnelWaitTimeout,
	waitForWowFunnelHandoff,
	waitForWowFunnelReady,
	wowFunnelSiteIsPaid,
} from '../wow-funnel';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: jest.fn() } },
} ) );

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
const mockGetSiteAdminUrl = getSiteAdminUrl as jest.Mock;
const mockGetSiteEditorUrl = getSiteEditorUrl as jest.Mock;
const mockWpcomGet = wpcom.req.get as jest.Mock;

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

describe( 'isSameWowFunnelRun', () => {
	const run = { funnelSlug: 'blueprint', funnelArgs: { blueprint_slug: 'coachava' } };

	it( 'matches the run that built the site', () => {
		expect( isSameWowFunnelRun( run, 'blueprint', { blueprint_slug: 'coachava' } ) ).toBe( true );
	} );

	it( 'does not match a different funnel', () => {
		expect( isSameWowFunnelRun( run, 'default', {} ) ).toBe( false );
	} );

	it( 'does not match the same funnel building something else', () => {
		expect( isSameWowFunnelRun( run, 'blueprint', { blueprint_slug: 'other' } ) ).toBe( false );
	} );
} );

describe( 'getWowFunnelEntryQueryArgs', () => {
	it( 'rebuilds the entry URL a run started from', () => {
		expect( getWowFunnelEntryQueryArgs( 'blueprint', { blueprint_slug: 'coachava' } ) ).toEqual( {
			wow_funnel: 'blueprint',
			blueprint: 'coachava',
		} );
	} );

	it( 'round-trips through the entry URL parsers', () => {
		const params = new URLSearchParams(
			getWowFunnelEntryQueryArgs( 'blueprint', { blueprint_slug: 'coachava' } )
		);

		expect(
			isSameWowFunnelRun(
				{ funnelSlug: 'blueprint', funnelArgs: { blueprint_slug: 'coachava' } },
				getWowFunnelSlug( params ) ?? '',
				getWowFunnelArgs( params )
			)
		).toBe( true );
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

describe( 'waitForWowFunnelHandoff', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns as soon as the site says the customer can sign in', async () => {
		mockWpcomGet.mockResolvedValue( { ready: true } );

		await waitForWowFunnelHandoff( 'site.example.com', { initialDelayMs: 0 } );

		expect( mockWpcomGet ).toHaveBeenCalledTimes( 1 );
		expect( mockWpcomGet ).toHaveBeenCalledWith( {
			path: '/sites/site.example.com/wow-funnel/handoff',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'keeps asking until the token the customer needs exists', async () => {
		mockWpcomGet
			.mockResolvedValueOnce( { ready: false } )
			.mockResolvedValueOnce( { ready: false } )
			.mockResolvedValueOnce( { ready: true } );

		await waitForWowFunnelHandoff( 'site.example.com', { initialDelayMs: 0, pollIntervalMs: 1 } );

		expect( mockWpcomGet ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'polls through a request that fails', async () => {
		mockWpcomGet
			.mockRejectedValueOnce( { error: 'http_request_failed', status: 504 } )
			.mockResolvedValueOnce( { ready: true } );

		await waitForWowFunnelHandoff( 'site.example.com', { initialDelayMs: 0, pollIntervalMs: 1 } );

		expect( mockWpcomGet ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'treats a server without the endpoint as ready, as before the wait existed', async () => {
		mockWpcomGet.mockRejectedValue( { error: 'rest_no_route', status: 404 } );

		await waitForWowFunnelHandoff( 'site.example.com', { initialDelayMs: 0 } );

		expect( mockWpcomGet ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'treats any 404 as a server that cannot answer, whatever its body says', async () => {
		mockWpcomGet.mockRejectedValue( { error: 'unknown_blog', status: 404 } );

		await waitForWowFunnelHandoff( 'site.example.com', { initialDelayMs: 0 } );

		expect( mockWpcomGet ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports running out of time as a timeout, not a failure', async () => {
		mockWpcomGet.mockResolvedValue( { ready: false } );

		const error = await waitForWowFunnelHandoff( 'site.example.com', {
			initialDelayMs: 0,
			pollIntervalMs: 1,
			totalTimeoutSeconds: 0.02,
		} ).catch( ( caught: unknown ) => caught );

		expect( isWowFunnelWaitTimeout( error ) ).toBe( true );
		expect( ( error as Error ).message ).toMatch( /taking longer than expected/i );
	} );

	it( 'stops asking once the caller has stopped waiting', async () => {
		mockWpcomGet.mockResolvedValue( { ready: false } );
		const abandon = new AbortController();

		const pending = waitForWowFunnelHandoff( 'site.example.com', {
			initialDelayMs: 0,
			pollIntervalMs: 5,
			signal: abandon.signal,
		} ).catch( ( caught: unknown ) => caught );

		await new Promise( ( resolve ) => setTimeout( resolve, 20 ) );
		abandon.abort();
		const error = await pending;
		const callsWhenAbandoned = mockWpcomGet.mock.calls.length;

		await new Promise( ( resolve ) => setTimeout( resolve, 30 ) );

		expect( error ).toBeInstanceOf( Error );
		expect( isWowFunnelWaitTimeout( error ) ).toBe( false );
		expect( mockWpcomGet.mock.calls.length ).toBe( callsWhenAbandoned );
	} );
} );

describe( 'waitForWowFunnelReady', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockTransferWait.mockImplementation( () => Promise.resolve() );
		mockImportWait.mockImplementation( () => Promise.resolve() );
		mockWpcomGet.mockResolvedValue( { ready: true } );
	} );

	it( 'waits for the hand-off after the build, for every funnel', async () => {
		await waitForWowFunnelReady( { funnelSlug: 'default', siteIdentifier: 'site.example.com' } );
		await waitForWowFunnelReady( { funnelSlug: 'blueprint', siteIdentifier: 'site.example.com' } );

		expect( mockWpcomGet ).toHaveBeenCalledTimes( 2 );
		expect( mockWpcomGet ).toHaveBeenCalledWith( {
			path: '/sites/site.example.com/wow-funnel/handoff',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'reports a hand-off that never becomes ready as a timeout, not a failure', async () => {
		jest.useFakeTimers();
		mockWpcomGet.mockResolvedValue( { ready: false } );

		const pending = waitForWowFunnelReady( {
			funnelSlug: 'default',
			siteIdentifier: 'site.example.com',
		} );
		const caught = pending.catch( ( error: unknown ) => error );

		await jest.advanceTimersByTimeAsync( 180 * 1000 );
		const error = await caught;

		expect( isWowFunnelWaitTimeout( error ) ).toBe( true );
		expect( ( error as Error ).message ).toMatch( /taking longer than expected/i );

		jest.useRealTimers();
	} );

	it( 'does not report a failed build as a timeout', async () => {
		mockTransferWait.mockImplementation( () =>
			Promise.reject( new Error( 'Atomic transfer failed with status: reverted' ) )
		);

		const error = await waitForWowFunnelReady( {
			funnelSlug: 'default',
			siteIdentifier: 'site.example.com',
		} ).catch( ( caught: unknown ) => caught );

		expect( isWowFunnelWaitTimeout( error ) ).toBe( false );
	} );

	it( 'waits only on the transfer for a transfer-readiness funnel', async () => {
		await waitForWowFunnelReady( { funnelSlug: 'default', siteIdentifier: 'site.example.com' } );

		expect( mockTransferWait ).toHaveBeenCalledWith( 'site.example.com', { initialDelayMs: 0 } );
		expect( mockImportWait ).not.toHaveBeenCalled();
	} );

	it( 'waits on the transfer and then the import for an import-readiness funnel', async () => {
		await waitForWowFunnelReady( { funnelSlug: 'blueprint', siteIdentifier: 'site.example.com' } );

		expect( mockTransferWait ).toHaveBeenCalledWith( 'site.example.com', { initialDelayMs: 0 } );
		expect( mockImportWait ).toHaveBeenCalledWith( 'site.example.com', { initialDelayMs: 0 } );
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

describe( 'getWowFunnelHandoffUrl', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetSiteAdminUrl.mockResolvedValue( 'https://fetched.example.com/wp-admin/' );
		mockGetSiteEditorUrl.mockReturnValue( 'https://example.com/editor' );
	} );

	/**
	 * The funnel lands in Big Sky's easy mode, where a build-wow build lands too. Easy mode
	 * only runs on the edit canvas, so the hand-off has to force it.
	 */
	it( 'hands the customer to the site editor in easy mode on the edit canvas', async () => {
		const url = await getWowFunnelHandoffUrl( {
			dest: 'editor',
			siteIdentifier: 'site.example.com',
			adminUrl: 'https://site.example.com/wp-admin/',
		} );

		expect( url ).toBe( 'https://example.com/editor' );
		expect( mockGetSiteEditorUrl ).toHaveBeenCalledWith(
			'https://site.example.com/wp-admin/',
			expect.objectContaining( { canvasEdit: true, easyMode: true } )
		);
	} );

	/**
	 * Easy mode always edits a page, and the plugin substitutes the site's own front page for
	 * the route — but only when the URL names no route. A `p` here (even `p=/`, the home
	 * template) would stop that substitution.
	 */
	it( 'names no route, so the plugin can pick the front page itself', async () => {
		await getWowFunnelHandoffUrl( {
			dest: 'editor',
			siteIdentifier: 'site.example.com',
			adminUrl: 'https://site.example.com/wp-admin/',
		} );

		const options = mockGetSiteEditorUrl.mock.calls[ 0 ][ 1 ];
		expect( options ).not.toHaveProperty( 'path' );
	} );

	it( 'uses the admin URL it is handed rather than fetching one', async () => {
		await getWowFunnelHandoffUrl( {
			dest: 'editor',
			siteIdentifier: 'site.example.com',
			adminUrl: 'https://site.example.com/wp-admin/',
		} );

		expect( mockGetSiteAdminUrl ).not.toHaveBeenCalled();
	} );

	it( 'fetches the admin URL when it is not handed one', async () => {
		await getWowFunnelHandoffUrl( { dest: 'editor', siteIdentifier: 'site.example.com' } );

		expect( mockGetSiteAdminUrl ).toHaveBeenCalledWith( 'site.example.com' );
		expect( mockGetSiteEditorUrl ).toHaveBeenCalledWith(
			'https://fetched.example.com/wp-admin/',
			expect.objectContaining( { canvasEdit: true, easyMode: true } )
		);
	} );
} );
