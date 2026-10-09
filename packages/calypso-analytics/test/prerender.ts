/** @jest-environment jsdom */

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn( () => Promise.resolve() ),
} ) );
jest.mock( '../src/utils/get-tracking-prefs', () => ( {
	__esModule: true,
	default: () => ( { buckets: { analytics: true } } ),
} ) );

function prerender( value: boolean | undefined ) {
	Object.defineProperty( document, 'prerendering', { configurable: true, value } );
}

function activate() {
	prerender( false );
	document.dispatchEvent( new Event( 'prerenderingchange' ) );
}

beforeEach( () => {
	window._tkq = [];
} );
afterEach( () => {
	activate();
	jest.clearAllMocks();
} );

test.each( [ false, undefined ] )(
	'ordinary documents load Tracks immediately (%s)',
	async ( value ) => {
		prerender( value );
		await jest.isolateModulesAsync( async () => {
			const tracks = await import( '../src/tracks' );
			const { loadScript } = await import( '@automattic/load-script' );
			expect( loadScript ).toHaveBeenCalledWith( '//stats.wp.com/w.js?69' );
			await tracks.getTracksLoadPromise();
			activate();
			expect( loadScript ).toHaveBeenCalledTimes( 1 );
		} );
	}
);

test( 'keeps identity and events queued in order until the loader activates once', async () => {
	prerender( true );
	await jest.isolateModulesAsync( async () => {
		const tracks = await import( '../src/tracks' );
		const { loadScript } = await import( '@automattic/load-script' );
		const user = { ID: 123, username: 'test', email: 'test@example.com' };
		const initialized = tracks.initializeAnalytics( user, undefined );
		const subscriber = jest.fn();
		tracks.analyticsEvents.on( 'record-event', subscriber );
		tracks.recordTracksEvent( 'calypso_test_first', { order: 1 } );
		tracks.recordTracksEvent( 'calypso_test_second', { order: 2 } );
		const expected = [
			[ 'identifyUser', 123, 'test' ],
			[ 'recordEvent', 'calypso_test_first', { order: 1 } ],
			[ 'recordEvent', 'calypso_test_second', { order: 2 } ],
		];
		expect( window._tkq ).toEqual( expected );
		expect( subscriber ).toHaveBeenCalledTimes( 2 );
		await Promise.resolve();
		expect( loadScript ).not.toHaveBeenCalled();
		activate();
		await initialized;
		activate();
		expect( loadScript ).toHaveBeenCalledTimes( 1 );
		expect( window._tkq ).toEqual( expected );
	} );
} );

test( 'preserves initialization when activation happens first', async () => {
	prerender( true );
	await jest.isolateModulesAsync( async () => {
		const tracks = await import( '../src/tracks' );
		const { loadScript } = await import( '@automattic/load-script' );
		activate();
		await tracks.initializeAnalytics( undefined, undefined );
		expect( loadScript ).toHaveBeenCalledTimes( 1 );
	} );
} );

test( 'waits for activation before attempting the blocked-analytics fallback', async () => {
	prerender( true );
	await jest.isolateModulesAsync( async () => {
		const { loadScript } = await import( '@automattic/load-script' );
		( loadScript as jest.Mock ).mockImplementation( ( url: string ) =>
			url.includes( 'w.js?' ) ? Promise.reject( new Error( 'blocked' ) ) : Promise.resolve()
		);
		const tracks = await import( '../src/tracks' );
		const initialized = tracks.initializeAnalytics( undefined, undefined );
		await Promise.resolve();
		expect( loadScript ).not.toHaveBeenCalled();
		activate();
		await initialized;
		expect( loadScript ).toHaveBeenNthCalledWith( 1, '//stats.wp.com/w.js?69' );
		expect( loadScript ).toHaveBeenNthCalledWith( 2, expect.stringContaining( '/nostats.js?' ) );
	} );
} );
