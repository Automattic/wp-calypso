/** @jest-environment jsdom */

import { createPreviewAssetLoader } from '../stream/preview-asset-loader';
import type { PreviewAsset, PreviewAssets } from '../stream/html-preview-document';

const MIB = 1024 * 1024;
const source = ( name = 'hero.png' ) => `/wp-content/themes/test/assets/${ name }`;
const asset = (
	index = 1,
	mime = 'image/png',
	token = 'header.payload.signature'
): PreviewAsset => {
	const id = index.toString( 16 ).padStart( 64, '0' );
	return {
		id,
		mime_type: mime,
		url: `https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/preview-assets/${ id }/content?token=${ token }`,
	};
};

function deferred< T >() {
	let resolve!: ( value: T ) => void;
	const promise = new Promise< T >( ( accept ) => {
		resolve = accept;
	} );
	return { promise, resolve };
}

function response(
	chunks = [ new Uint8Array( [ 1, 2, 3 ] ) ],
	mime = 'image/png',
	length?: string
) {
	let index = 0;
	const reader = {
		read: jest.fn( async () =>
			index < chunks.length ? { done: false, value: chunks[ index++ ] } : { done: true }
		),
		cancel: jest.fn().mockResolvedValue( undefined ),
		releaseLock: jest.fn(),
	};
	const body = { getReader: () => reader, cancel: jest.fn().mockResolvedValue( undefined ) };
	const value = {
		ok: true,
		redirected: false,
		headers: {
			get: ( key: string ) => ( key === 'Content-Type' ? mime : ( length ?? null ) ),
		},
		body,
	};
	return { value, reader };
}

const originalFetch = global.fetch;
let loader: ReturnType< typeof createPreviewAssetLoader >;
let fetchMock: jest.Mock;

beforeEach( () => {
	loader = createPreviewAssetLoader(
		'https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/snapshot'
	);
	fetchMock = jest.fn().mockImplementation( async () => response().value );
	global.fetch = fetchMock;
} );

afterEach( () => {
	loader.dispose();
	global.fetch = originalFetch;
	jest.useRealTimers();
} );

const load = ( assets: PreviewAssets, signal = new AbortController().signal ) =>
	loader.load( assets, signal );

it( 'fetches only with the signed URL, CORS, no cookies, no redirects and no referrer', async () => {
	const image = asset();
	const result = await load( { [ source() ]: image } );
	expect( fetchMock ).toHaveBeenCalledWith( image.url, {
		credentials: 'omit',
		redirect: 'error',
		mode: 'cors',
		referrerPolicy: 'no-referrer',
		signal: expect.any( AbortSignal ),
	} );
	expect( result[ source() ] ).toEqual( {
		id: image.id,
		mimeType: 'image/png',
		bytes: new Uint8Array( [ 1, 2, 3 ] ).buffer,
	} );
} );

it.each( [
	{ url: asset().url.replace( 'https:', 'http:' ) },
	{ url: asset().url.replace( 'public-api.wordpress.com', 'evil.example' ) },
	{ url: asset().url.replace( 'public-api.', 'user:password@public-api.' ) },
	{ url: asset().url.replace( '/sites/123/', '/sites/0/' ) },
	{ url: asset().url.replace( '/content?', '/other?' ) },
	{ url: asset().url.replace( asset().id, asset( 2 ).id ) },
	{ url: asset().url + '#fragment' },
	{ url: asset().url + '&redirect=https://evil.example' },
	{ url: asset().url + '&token=another.token.value' },
	{ url: asset().url.replace( 'header.payload.signature', 'invalid' ) },
	{ url: 'not a URL' },
	{ mime_type: 'image/svg+xml' },
	{ mime_type: 'text/html' },
	{ id: 'invalid' },
] )( 'rejects an unsafe reference before fetching (case %#)', async ( invalid ) => {
	expect( await load( { [ source() ]: { ...asset(), ...invalid } } ) ).toEqual( {} );
	expect( fetchMock ).not.toHaveBeenCalled();
} );

it( 'rejects sources outside generated theme assets', async () => {
	expect( await load( { 'https://evil.example/image': asset() } ) ).toEqual( {} );
	expect( fetchMock ).not.toHaveBeenCalled();
} );

it( 'deduplicates aliases and renewed tokens and protects cached buffers from caller mutation', async () => {
	const image = asset();
	const result = await load( { [ source() ]: image, [ source( 'other.png' ) ]: image } );
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	expect( result[ source() ].bytes ).not.toBe( result[ source( 'other.png' ) ].bytes );
	new Uint8Array( result[ source() ].bytes ).fill( 9 );
	const renewed = await load( {
		[ source() ]: asset( 1, 'image/png', 'renewed.token.signature' ),
	} );
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	expect( [ ...new Uint8Array( renewed[ source() ].bytes ) ] ).toEqual( [ 1, 2, 3 ] );
} );

it( 'accepts fonts and verifies response MIME against the reference', async () => {
	fetchMock.mockResolvedValueOnce( response( undefined, 'font/woff2; charset=binary' ).value );
	const font = asset( 2, 'font/woff2' );
	expect(
		( await load( { [ source( 'heading.woff2' ) ]: font } ) )[ source( 'heading.woff2' ) ].mimeType
	).toBe( 'font/woff2' );
	fetchMock.mockResolvedValueOnce( response( undefined, 'text/html' ).value );
	expect( await load( { [ source() ]: asset() } ) ).toEqual( {} );
	await load( { [ source() ]: asset() } );
	expect( fetchMock ).toHaveBeenCalledTimes( 3 );
} );

it( 'rejects a conflicting MIME even on a cached content ID', async () => {
	await load( { [ source() ]: asset() } );
	expect( await load( { [ source() ]: asset( 1, 'font/woff2' ) } ) ).toEqual( {} );
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
} );

it( 'omits failed assets while retaining successful mappings', async () => {
	fetchMock.mockRejectedValueOnce( new Error( 'Offline' ) );
	fetchMock.mockResolvedValueOnce( { ...response().value, ok: false } );
	const result = await load( {
		[ source( 'one.png' ) ]: asset( 1 ),
		[ source( 'two.png' ) ]: asset( 2 ),
		[ source( 'three.png' ) ]: asset( 3 ),
	} );
	expect( Object.keys( result ) ).toEqual( [ source( 'three.png' ) ] );
} );

it( 'rejects redirected, empty and non-streaming responses', async () => {
	fetchMock.mockResolvedValueOnce( { ...response().value, redirected: true } );
	fetchMock.mockResolvedValueOnce( response( [] ).value );
	fetchMock.mockResolvedValueOnce( { ...response().value, body: null } );
	expect(
		await load( {
			[ source( 'one.png' ) ]: asset( 1 ),
			[ source( 'two.png' ) ]: asset( 2 ),
			[ source( 'three.png' ) ]: asset( 3 ),
		} )
	).toEqual( {} );
} );

it( 'rejects an oversized declared response before reading it', async () => {
	const oversized = response( undefined, 'image/png', String( 8 * MIB + 1 ) );
	fetchMock.mockResolvedValueOnce( oversized.value );
	expect( await load( { [ source() ]: asset() } ) ).toEqual( {} );
	expect( oversized.reader.read ).not.toHaveBeenCalled();
	expect( oversized.value.body.cancel ).toHaveBeenCalled();
} );

it( 'bounds actual streamed bytes even when Content-Length is absent or false', async () => {
	for ( const declared of [ undefined, '1' ] ) {
		const oversized = response(
			[ new Uint8Array( 8 * MIB ), new Uint8Array( 1 ) ],
			'image/png',
			declared
		);
		fetchMock.mockResolvedValueOnce( oversized.value );
		expect( await load( { [ source() ]: asset() } ) ).toEqual( {} );
		expect( oversized.reader.cancel ).toHaveBeenCalled();
		expect( oversized.reader.releaseLock ).toHaveBeenCalled();
	}
} );

it( 'limits a batch to 96 entries', async () => {
	const assets = Object.fromEntries(
		Array.from( { length: 97 }, ( _, index ) => [ source( `${ index }.png` ), asset( index + 1 ) ] )
	);
	expect( Object.keys( await load( assets ) ) ).toHaveLength( 96 );
	expect( fetchMock ).toHaveBeenCalledTimes( 96 );
} );

it( 'limits returned and cached bytes, evicting the least recently used content', async () => {
	fetchMock.mockImplementation( async () => response( [ new Uint8Array( 8 * MIB ) ] ).value );
	const assets = Object.fromEntries(
		Array.from( { length: 5 }, ( _, index ) => [ source( `${ index }.png` ), asset( index + 1 ) ] )
	);
	const result = await load( assets );
	expect( Object.values( result ).reduce( ( sum, item ) => sum + item.bytes.byteLength, 0 ) ).toBe(
		32 * MIB
	);
	await load( { [ source() ]: asset( 5 ) } );
	expect( fetchMock ).toHaveBeenCalledTimes( 6 );
	await load( { [ source() ]: asset( 1 ) } );
	expect( fetchMock ).toHaveBeenCalledTimes( 7 );
} );

it( 'does not commit partially downloaded assets from a subsequently aborted load', async () => {
	const downloaded = response();
	const finished = deferred< void >();
	downloaded.reader.releaseLock.mockImplementation( () => finished.resolve() );
	fetchMock.mockResolvedValueOnce( downloaded.value );
	fetchMock.mockReturnValueOnce( new Promise( () => {} ) );
	const controller = new AbortController();
	const pending = load(
		{ [ source() ]: asset(), [ source( 'other.png' ) ]: asset( 2 ) },
		controller.signal
	);
	await finished.promise;
	controller.abort();
	expect( await pending ).toEqual( {} );
	await load( { [ source() ]: asset() } );
	expect( fetchMock ).toHaveBeenCalledTimes( 3 );
} );

it( 'limits fetch concurrency across simultaneous loads', async () => {
	const gates = Array.from( { length: 5 }, () =>
		deferred< ReturnType< typeof response >[ 'value' ] >()
	);
	gates.forEach( ( gate ) => fetchMock.mockReturnValueOnce( gate.promise ) );
	const first = load( { [ source( '1.png' ) ]: asset( 1 ), [ source( '2.png' ) ]: asset( 2 ) } );
	const second = load( {
		[ source( '3.png' ) ]: asset( 3 ),
		[ source( '4.png' ) ]: asset( 4 ),
		[ source( '5.png' ) ]: asset( 5 ),
	} );
	expect( fetchMock ).toHaveBeenCalledTimes( 3 );
	gates.forEach( ( gate ) => gate.resolve( response().value ) );
	await Promise.all( [ first, second ] );
	expect( fetchMock ).toHaveBeenCalledTimes( 5 );
} );

it( 'shares an in-flight ID across token renewal without one caller aborting another', async () => {
	const gate = deferred< ReturnType< typeof response >[ 'value' ] >();
	fetchMock.mockReturnValueOnce( gate.promise );
	const controller = new AbortController();
	const first = load( { [ source() ]: asset() }, controller.signal );
	const second = load( { [ source() ]: asset( 1, 'image/png', 'renewed.token.signature' ) } );
	controller.abort();
	expect( await first ).toEqual( {} );
	expect( fetchMock.mock.calls[ 0 ][ 1 ].signal.aborted ).toBe( false );
	gate.resolve( response().value );
	expect( ( await second )[ source() ].id ).toBe( asset().id );
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
} );

it( 'never fetches for an already aborted caller', async () => {
	const controller = new AbortController();
	controller.abort();
	expect( await load( { [ source() ]: asset() }, controller.signal ) ).toEqual( {} );
	expect( fetchMock ).not.toHaveBeenCalled();
} );

it( 'aborts active and queued work and never caches a stale fetch response', async () => {
	const gates = Array.from( { length: 3 }, () =>
		deferred< ReturnType< typeof response >[ 'value' ] >()
	);
	gates.forEach( ( gate ) => fetchMock.mockReturnValueOnce( gate.promise ) );
	const controller = new AbortController();
	const pending = load(
		Object.fromEntries(
			Array.from( { length: 4 }, ( _, index ) => [
				source( `${ index }.png` ),
				asset( index + 1 ),
			] )
		),
		controller.signal
	);
	controller.abort();
	expect( await pending ).toEqual( {} );
	expect( fetchMock.mock.calls.every( ( [ , options ] ) => options.signal.aborted ) ).toBe( true );
	gates.forEach( ( gate ) => gate.resolve( response().value ) );
	const retry = await load( { [ source() ]: asset() } );
	expect( retry[ source() ].id ).toBe( asset().id );
	expect( fetchMock ).toHaveBeenCalledTimes( 4 );
} );

it( 'does not cache bytes when aborted during streaming', async () => {
	const gate = deferred< { done: boolean; value: Uint8Array< ArrayBuffer > } >();
	const streaming = response();
	streaming.reader.read.mockImplementationOnce( () => gate.promise );
	fetchMock.mockResolvedValueOnce( streaming.value );
	const controller = new AbortController();
	const pending = load( { [ source() ]: asset() }, controller.signal );
	await Promise.resolve();
	controller.abort();
	expect( await pending ).toEqual( {} );
	gate.resolve( { done: false, value: new Uint8Array( [ 9 ] ) } );
	await load( { [ source() ]: asset() } );
	expect( fetchMock ).toHaveBeenCalledTimes( 2 );
} );

it( 'disposes pending work, clears the cache and makes future loads inert', async () => {
	await load( { [ source() ]: asset() } );
	fetchMock.mockReturnValueOnce( new Promise( () => {} ) );
	const pending = load( { [ source() ]: asset( 2 ) } );
	loader.dispose();
	loader.dispose();
	expect( await pending ).toEqual( {} );
	expect( fetchMock.mock.calls[ 1 ][ 1 ].signal.aborted ).toBe( true );
	expect( await load( { [ source() ]: asset() } ) ).toEqual( {} );
	expect( fetchMock ).toHaveBeenCalledTimes( 2 );
} );

it( 'times out stalled requests, releases queue slots and never caches their late responses', async () => {
	jest.useFakeTimers();
	const gates = Array.from( { length: 3 }, () =>
		deferred< ReturnType< typeof response >[ 'value' ] >()
	);
	gates.forEach( ( gate ) => fetchMock.mockReturnValueOnce( gate.promise ) );
	const pending = load(
		Object.fromEntries(
			Array.from( { length: 4 }, ( _, index ) => [
				source( `${ index }.png` ),
				asset( index + 1 ),
			] )
		)
	);
	expect( fetchMock ).toHaveBeenCalledTimes( 3 );
	await jest.advanceTimersByTimeAsync( 14999 );
	expect( fetchMock ).toHaveBeenCalledTimes( 3 );
	await jest.advanceTimersByTimeAsync( 1 );
	expect( Object.keys( await pending ) ).toEqual( [ source( '3.png' ) ] );
	expect(
		fetchMock.mock.calls.slice( 0, 3 ).every( ( [ , options ] ) => options.signal.aborted )
	).toBe( true );
	gates.forEach( ( gate ) => gate.resolve( response().value ) );
	await load( { [ source() ]: asset() } );
	expect( fetchMock ).toHaveBeenCalledTimes( 5 );
	expect( jest.getTimerCount() ).toBe( 0 );
} );

it( 'applies the deadline while reading a stalled response body', async () => {
	jest.useFakeTimers();
	const streaming = response();
	streaming.reader.read.mockReturnValueOnce( new Promise( () => {} ) );
	fetchMock.mockResolvedValueOnce( streaming.value );
	const pending = load( { [ source() ]: asset() } );
	await jest.advanceTimersByTimeAsync( 15000 );
	expect( await pending ).toEqual( {} );
	expect( streaming.reader.cancel ).toHaveBeenCalled();
	expect( fetchMock.mock.calls[ 0 ][ 1 ].signal.aborted ).toBe( true );
	await load( { [ source() ]: asset() } );
	expect( fetchMock ).toHaveBeenCalledTimes( 2 );
	expect( jest.getTimerCount() ).toBe( 0 );
} );

const localSnapshot =
	'http://calypso.localhost:4001/api/calypso/amber-brook/big-sky/build-wow/snapshot';
const localAsset = ( index = 1, mime = 'image/png' ): PreviewAsset => {
	const value = asset( index, mime );
	return {
		...value,
		url: localSnapshot.replace(
			'/snapshot',
			`/preview-assets/${ value.id }/content?token=header.payload.signature`
		),
	};
};

it( 'loads cockpit images and fonts from the accepted feed without credentials', async () => {
	loader.dispose();
	loader = createPreviewAssetLoader( localSnapshot );
	fetchMock
		.mockResolvedValueOnce( response().value )
		.mockResolvedValueOnce( response( [ new Uint8Array( [ 4, 5 ] ) ], 'font/woff2' ).value );
	const image = localAsset();
	const font = localAsset( 2, 'font/woff2' );
	const result = await load( { [ source() ]: image, [ source( 'font.woff2' ) ]: font } );
	expect( Object.keys( result ) ).toHaveLength( 2 );
	expect( fetchMock ).toHaveBeenCalledWith(
		font.url,
		expect.objectContaining( {
			credentials: 'omit',
			redirect: 'error',
			referrerPolicy: 'no-referrer',
		} )
	);
} );

it.each( [
	( url: string ) => url.replace( 'calypso.localhost', 'localhost' ),
	( url: string ) => url.replace( 'amber-brook', 'another-project' ),
	( url: string ) => url.replace( ':4001', ':4002' ),
] )( 'rejects another feed even when its asset ID is cached (case %#)', async ( change ) => {
	loader.dispose();
	loader = createPreviewAssetLoader( localSnapshot );
	const image = localAsset();
	await load( { [ source() ]: image } );
	fetchMock.mockClear();
	expect( await load( { [ source() ]: { ...image, url: change( image.url ) } } ) ).toEqual( {} );
	expect( fetchMock ).not.toHaveBeenCalled();
} );
