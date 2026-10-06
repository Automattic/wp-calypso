/** @jest-environment jsdom */

import { whenDocumentActive } from '../src/when-document-active';

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

afterEach( () => {
	activate();
	jest.clearAllMocks();
	window._tkq = [];
} );

test.each( [ false, undefined ] )( 'ordinary documents run synchronously (%s)', ( value ) => {
	prerender( value );
	const callback = jest.fn( () => 42 );
	expect( whenDocumentActive( callback ) ).toBe( 42 );
	expect( callback ).toHaveBeenCalledTimes( 1 );
} );

test( 'unused prerenders stay silent and activation preserves callback order exactly once', async () => {
	prerender( true );
	const calls: number[] = [];
	const first = whenDocumentActive( () => calls.push( 1 ) );
	const second = whenDocumentActive( () => calls.push( 2 ) );
	await Promise.resolve();
	expect( calls ).toEqual( [] );
	activate();
	whenDocumentActive( () => calls.push( 3 ) );
	activate();
	await Promise.all( [ first, second ] );
	expect( calls ).toEqual( [ 1, 2, 3 ] );
} );

test( 'one failed callback does not prevent other callbacks from activating', async () => {
	prerender( true );
	const failure = whenDocumentActive( () => {
		throw new Error( 'failure' );
	} );
	const success = jest.fn();
	whenDocumentActive( success );
	activate();
	await expect( failure ).rejects.toThrow( 'failure' );
	expect( success ).toHaveBeenCalledTimes( 1 );
} );

test( 'Tracks delays its script, identity, event and subscribers until activation', async () => {
	prerender( true );
	await jest.isolateModulesAsync( async () => {
		const tracks = await import( '../src/tracks' );
		const { loadScript: loaded } = await import( '@automattic/load-script' );
		const subscriber = jest.fn();
		tracks.analyticsEvents.on( 'record-event', subscriber );
		tracks.identifyUser( { ID: 123, username: 'prerender-test', email: 'test@example.com' } );
		tracks.recordTracksEvent( 'calypso_test_view', { order: 1 } );
		expect( loaded ).not.toHaveBeenCalled();
		expect( window._tkq ).toEqual( [] );
		expect( subscriber ).not.toHaveBeenCalled();
		activate();
		expect( loaded ).toHaveBeenCalledTimes( 1 );
		expect( window._tkq ).toEqual( [
			[ 'identifyUser', 123, 'prerender-test' ],
			[ 'recordEvent', 'calypso_test_view', { order: 1 } ],
		] );
		expect( subscriber ).toHaveBeenCalledTimes( 1 );
	} );
} );

test( 'queued events retain their original properties and per-event subscribers', async () => {
	prerender( true );
	await jest.isolateModulesAsync( async () => {
		const tracks = await import( '../src/tracks' );
		let step = 'first';
		const initialized = tracks.initializeAnalytics( undefined, () => ( { step } ) );
		const forwarded: unknown[] = [];
		const onRecord = ( name: string, props: unknown ) => forwarded.push( [ name, props ] );
		tracks.recordTracksEvent( 'calypso_test_first', {}, onRecord );
		step = 'second';
		tracks.recordTracksEvent( 'calypso_test_second', {}, onRecord );
		expect( forwarded ).toEqual( [] );
		activate();
		await initialized;
		expect( forwarded ).toEqual( [
			[ 'calypso_test_first', { step: 'first' } ],
			[ 'calypso_test_second', { step: 'second' } ],
		] );
	} );
} );
