/** @jest-environment jsdom */

import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { BuildHtmlPreview } from '../stream/html-preview';
import { htmlPreviewDocument } from '../stream/html-preview-document';
import { applyStreamEvent, initialStreamState, stateFromSnapshot } from '../stream/reducer';
import { parseStreamInfo } from '../stream/types';
import { useBuildHtmlPreview } from '../stream/use-build-html-preview';
import type { StreamPreview } from '../stream/reducer';
import type { BuildWowStreamView } from '../stream/use-build-wow-stream';

const reference: StreamPreview = {
	route: '/',
	documentId: 'a'.repeat( 64 ),
	epoch: '1:1',
	ready: false,
};
const stream: BuildWowStreamView = {
	info: {
		protocol: 1,
		blogId: 123,
		runId: 'run-1',
		capabilities: [ 'preview:dsl-html' ],
		eventsUrl: 'https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/events',
		snapshotUrl: 'https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/snapshot',
		previewUrl: 'https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/preview',
	},
	state: { ...initialStreamState( 'run-1' ), previews: { '/': reference } },
	authorize: async () => 'Bearer site-token',
};

const payload = {
	v: 1,
	run_id: 'run-1',
	epoch: '1:1',
	route: '/',
	format: 'dsl-html',
	document_id: reference.documentId,
	html: '<html><head><style>body { color: red }</style></head><body><h1>Hello</h1></body></html>',
};
const originalFetch = global.fetch;
afterEach( () => {
	global.fetch = originalFetch;
	jest.useRealTimers();
} );

it( 'fetches page HTML through site-scoped authentication', async () => {
	global.fetch = jest.fn().mockResolvedValue( { ok: true, json: async () => payload } );
	const { result } = renderHook( () => useBuildHtmlPreview( reference, stream ) );
	await waitFor( () => expect( result.current.html ).toBe( payload.html ) );
	expect( global.fetch ).toHaveBeenCalledWith(
		stream.info.previewUrl + '?run_id=run-1&route=%2F',
		expect.objectContaining( {
			headers: { Authorization: 'Bearer site-token' },
			credentials: 'omit',
			redirect: 'error',
		} )
	);
} );

it( 'keeps the previous document during an update, but clears it on page, epoch or run changes', async () => {
	global.fetch = jest.fn().mockResolvedValue( { ok: true, json: async () => payload } );
	const { result, rerender } = renderHook( ( { ref, view } ) => useBuildHtmlPreview( ref, view ), {
		initialProps: { ref: reference, view: stream },
	} );
	await waitFor( () => expect( result.current.html ).toBe( payload.html ) );
	global.fetch = jest.fn().mockReturnValue( new Promise( () => {} ) );
	rerender( { ref: { ...reference, documentId: 'b'.repeat( 64 ) }, view: stream } );
	expect( result.current.html ).toBe( payload.html );
	rerender( { ref: { ...reference, route: '/about/' }, view: stream } );
	expect( result.current.html ).toBeNull();
	rerender( { ref: { ...reference, epoch: '1:2' }, view: stream } );
	expect( result.current.html ).toBeNull();
	rerender( { ref: reference, view: { ...stream, info: { ...stream.info, runId: 'run-2' } } } );
	expect( result.current.html ).toBeNull();
} );

it.each( [
	{ run_id: 'another-run' },
	{ epoch: '1:2' },
	{ route: '/other/' },
	{ format: 'unknown' },
	{ html: 'é'.repeat( 131073 ) },
] )( 'rejects mismatched or oversized documents (case %#)', async ( invalid ) => {
	global.fetch = jest
		.fn()
		.mockResolvedValue( { ok: true, json: async () => ( { ...payload, ...invalid } ) } );
	const { result } = renderHook( () => useBuildHtmlPreview( reference, stream ) );
	await act( async () => {} );
	expect( global.fetch ).toHaveBeenCalled();
	expect( result.current.html ).toBeNull();
} );

it( 'retries a transient failure without requiring another preview event', async () => {
	jest.useFakeTimers();
	global.fetch = jest
		.fn()
		.mockRejectedValueOnce( new Error( 'Offline' ) )
		.mockResolvedValue( { ok: true, json: async () => payload } );
	const { result } = renderHook( () => useBuildHtmlPreview( reference, stream ) );
	await act( async () => {} );
	await act( async () => {
		jest.advanceTimersByTime( 1000 );
	} );
	expect( result.current.html ).toBe( payload.html );
} );

it( 'restores preview references from snapshots and clears them on phase retries', () => {
	const data = { route: '/', document_id: reference.documentId, epoch: '1:1', format: 'dsl-html' };
	const live = applyStreamEvent( initialStreamState( 'run-1' ), 'preview.available', data );
	const recovered = stateFromSnapshot( 'run-1', 8, { previews: { '/': data } } );
	expect( recovered.previews ).toEqual( live.previews );
	const started = applyStreamEvent( live, 'phase.started', { phase: 'finish_apply' } );
	expect(
		applyStreamEvent( started, 'phase.started', { phase: 'finish_apply' } ).previews
	).toEqual( {} );
	expect( applyStreamEvent( live, 'preview.available', { ...data, format: 'unknown' } ) ).toBe(
		live
	);
} );

it( 'never accepts a preview endpoint on another origin', () => {
	const info = parseStreamInfo( {
		protocol: 1,
		blog_id: 123,
		run_id: 'run-1',
		events_url: stream.info.eventsUrl,
		snapshot_url: stream.info.snapshotUrl,
		preview_url: 'https://other.example/preview',
	} );
	expect( info?.previewUrl ).toBeUndefined();
} );

it( 'keeps HTML and inline CSS while stripping active markup and external resources', () => {
	const output = htmlPreviewDocument( `<!doctype html><html><head>
		<meta http-equiv="refresh" content="0;url=https://other.example">
		<base href="https://other.example"><link rel="stylesheet" href="https://other.example/style.css">
		<style>h1 { color: red }</style><script>window.parent.alert(1)</script>
		</head><body onload="alert(1)"><h1>Hello</h1>
		<a href="https://other.example" ping="https://other.example">Link</a>
		<img src="https://other.example/image"><iframe srcdoc="unsafe"></iframe>
		<form action="https://other.example"><input name="secret"></form>
		<svg onload="alert(1)"></svg></body></html>` );
	const doc = new DOMParser().parseFromString( output, 'text/html' );
	expect( doc.querySelector( 'h1' )?.textContent ).toBe( 'Hello' );
	expect( doc.querySelector( 'style' )?.textContent ).toContain( 'color: red' );
	expect(
		doc.querySelector(
			'script, iframe, form, img, svg, base, link, [onload], [href], [src], [ping]'
		)
	).toBeNull();
	expect( doc.head.firstElementChild?.getAttribute( 'http-equiv' ) ).toBe(
		'Content-Security-Policy'
	);
	expect( doc.querySelectorAll( 'meta' ) ).toHaveLength( 2 );
	expect( doc.querySelector( 'meta[name=referrer]' )?.getAttribute( 'content' ) ).toBe(
		'no-referrer'
	);
	expect( doc.querySelector( 'meta' )?.content ).toContain( "default-src 'none'" );
} );

it( 'renders in an iframe with an opaque origin and no scripts', async () => {
	global.fetch = jest.fn().mockResolvedValue( { ok: true, json: async () => payload } );
	render( <BuildHtmlPreview stream={ stream } /> );
	const iframe = await screen.findByTitle( 'Site preview' );
	expect( iframe.getAttribute( 'sandbox' ) ).toBe( '' );
	expect( iframe.getAttribute( 'srcdoc' ) ).toContain( '<h1>Hello</h1>' );
} );

it( 'switches between streamed pages using the same authenticated endpoint', async () => {
	global.fetch = jest.fn().mockImplementation( async ( url: string ) => ( {
		ok: true,
		json: async () => ( { ...payload, route: new URL( url ).searchParams.get( 'route' ) } ),
	} ) );
	render(
		<BuildHtmlPreview
			stream={ {
				...stream,
				state: {
					...stream.state,
					previews: {
						'/': reference,
						'/about/': { ...reference, route: '/about/' },
					},
				},
			} }
		/>
	);
	await screen.findByTitle( 'Site preview' );
	fireEvent.change( screen.getByLabelText( 'Page preview' ), { target: { value: '/about/' } } );
	await waitFor( () =>
		expect( global.fetch ).toHaveBeenLastCalledWith(
			stream.info.previewUrl + '?run_id=run-1&route=%2Fabout%2F',
			expect.anything()
		)
	);
	await screen.findByTitle( 'Site preview' );
} );

const imageSource = '/wp-content/themes/test/assets/hero.png?v=abcdef12';
const fontSource = '/wp-content/themes/test/assets/fonts/heading.woff2';
const assetUrl = ( id: string, token = 'header.payload.signature' ) =>
	`https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/preview-assets/${ id }/content?token=${ token }`;
const imageAsset = {
	id: 'a'.repeat( 64 ),
	mime_type: 'image/png',
	url: assetUrl( 'a'.repeat( 64 ) ),
};
const fontAsset = {
	id: 'b'.repeat( 64 ),
	mime_type: 'font/woff2',
	url: assetUrl( 'b'.repeat( 64 ) ),
};

it( 'rewrites registered images, CSS backgrounds and bundled fonts with a scoped CSP', () => {
	const output = htmlPreviewDocument(
		`<html><head><style>@font-face{font-family:Heading;src:url('${ fontSource }')} .hero{background-image:url("${ imageSource }")} .bad{background:url(https://evil.example/track)}</style></head><body><img src="${ imageSource }" srcset="https://evil.example/track 2x" onerror="alert(1)"><img src="https://evil.example/image"><div style="background:url('${ imageSource }')"></div></body></html>`,
		{ [ imageSource ]: imageAsset, [ fontSource ]: fontAsset }
	);
	const doc = new DOMParser().parseFromString( output, 'text/html' );
	expect( doc.querySelectorAll( 'img' ) ).toHaveLength( 1 );
	expect( doc.querySelector( 'img' )?.getAttribute( 'src' ) ).toBe( imageAsset.url );
	expect( doc.querySelector( 'img' )?.getAttribute( 'crossorigin' ) ).toBe( 'anonymous' );
	expect( doc.querySelector( 'img' )?.getAttribute( 'referrerpolicy' ) ).toBe( 'no-referrer' );
	expect( doc.querySelector( '[onerror], [srcset]' ) ).toBeNull();
	expect( doc.querySelector( 'style' )?.textContent ).toContain( fontAsset.url );
	expect( doc.querySelector( 'style' )?.textContent ).toContain( imageAsset.url );
	expect( doc.querySelector( '[style]' )?.getAttribute( 'style' ) ).toContain( imageAsset.url );
	expect( output ).not.toContain( 'evil.example' );
	const csp = doc.querySelector( 'meta' )?.content;
	expect( csp ).toContain( `img-src ${ imageAsset.url.split( '?' )[ 0 ] }` );
	expect( csp ).toContain( `font-src ${ fontAsset.url.split( '?' )[ 0 ] }` );
	expect( csp ).not.toContain( 'token=' );
	expect( csp ).toContain( "script-src 'none'" );
} );

it.each( [
	{ url: 'https://evil.example/image' },
	{ url: assetUrl( 'a'.repeat( 64 ) ).replace( '/sites/123/', '/sites/456/' ) },
	{ url: assetUrl( 'a'.repeat( 64 ) ) + '&redirect=https://evil.example' },
	{ url: assetUrl( 'b'.repeat( 64 ) ) },
	{ mime_type: 'image/svg+xml' },
	{ mime_type: 'text/html' },
] )(
	'drops invalid asset references from the authenticated response (case %#)',
	async ( invalid ) => {
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			json: async () => ( {
				...payload,
				assets: { [ imageSource ]: { ...imageAsset, ...invalid } },
			} ),
		} );
		const { result } = renderHook( () => useBuildHtmlPreview( reference, stream ) );
		await waitFor( () => expect( result.current.html ).toBe( payload.html ) );
		expect( result.current.assets ).toEqual( {} );
	}
);

it( 'renews signed URLs without another build event and cancels renewal on unmount', async () => {
	jest.useFakeTimers();
	global.fetch = jest.fn().mockImplementation( async () => ( {
		ok: true,
		json: async () => ( {
			...payload,
			assets: { [ imageSource ]: imageAsset },
			assets_expires_at: Math.floor( Date.now() / 1000 ) + 600,
		} ),
	} ) );
	const { result, unmount } = renderHook( () => useBuildHtmlPreview( reference, stream ) );
	await act( async () => {} );
	expect( result.current.assets?.[ imageSource ] ).toEqual( imageAsset );
	expect( global.fetch ).toHaveBeenCalledTimes( 1 );
	await act( async () => {
		jest.advanceTimersByTime( 300000 );
	} );
	expect( global.fetch ).toHaveBeenCalledTimes( 2 );
	unmount();
	await act( async () => {
		jest.advanceTimersByTime( 600000 );
	} );
	expect( global.fetch ).toHaveBeenCalledTimes( 2 );
} );

// A build followed from a local status server names its own feed; preview
// assets are read from wherever that feed's snapshot is served.
const localFeed = 'http://calypso.localhost:4001/api/calypso/sites/amber-brook/big-sky/build-wow';
const localStream: BuildWowStreamView = {
	...stream,
	info: {
		...stream.info,
		eventsUrl: `${ localFeed }/events?run_id=run-1`,
		snapshotUrl: `${ localFeed }/snapshot?run_id=run-1`,
		previewUrl: `${ localFeed }/preview?run_id=run-1`,
	},
};
const localAssetUrl = ( id: string, token = 'header.payload.signature' ) =>
	`${ localFeed }/preview-assets/${ id }/content?token=${ token }`;
const localImageAsset = {
	id: 'a'.repeat( 64 ),
	mime_type: 'image/png',
	url: localAssetUrl( 'a'.repeat( 64 ) ),
};

function respondWithAssets( assets: Record< string, unknown > ) {
	global.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		json: async () => ( { ...payload, assets } ),
	} );
}

it( 'accepts preview assets served by the local feed the stream names', async () => {
	respondWithAssets( { [ imageSource ]: localImageAsset } );
	const { result } = renderHook( () => useBuildHtmlPreview( reference, localStream ) );
	await waitFor( () =>
		expect( result.current.assets?.[ imageSource ] ).toEqual( localImageAsset )
	);
	const output = htmlPreviewDocument(
		`<html><head></head><body><img src="${ imageSource }"></body></html>`,
		result.current.assets
	);
	const csp = new DOMParser()
		.parseFromString( output, 'text/html' )
		.querySelector( 'meta' )?.content;
	expect( csp ).toContain( `img-src ${ localImageAsset.url.split( '?' )[ 0 ] }` );
} );

it.each( [
	// The WordPress.com host is only trusted when the feed itself is WordPress.com's.
	{ url: assetUrl( 'a'.repeat( 64 ) ) },
	{ url: localAssetUrl( 'a'.repeat( 64 ) ).replace( 'calypso.localhost', '127.0.0.1' ) },
	{ url: localAssetUrl( 'a'.repeat( 64 ) ).replace( '/amber-brook/', '/other-site/' ) },
	{ url: localAssetUrl( 'b'.repeat( 64 ) ) },
	{ url: localAssetUrl( 'a'.repeat( 64 ) ).replace( 'preview-assets', 'files' ) },
	{ url: localAssetUrl( 'a'.repeat( 64 ) ) + '&redirect=https://evil.example' },
	{ url: localAssetUrl( 'a'.repeat( 64 ), 'not-a-token' ) },
] )( 'drops asset references that are not on the local feed (case %#)', async ( invalid ) => {
	respondWithAssets( { [ imageSource ]: { ...localImageAsset, ...invalid } } );
	const { result } = renderHook( () => useBuildHtmlPreview( reference, localStream ) );
	await waitFor( () => expect( result.current.html ).toBe( payload.html ) );
	expect( result.current.assets ).toEqual( {} );
} );

it( 'trusts the WordPress.com host only for a feed served from WordPress.com', async () => {
	respondWithAssets( { [ imageSource ]: localImageAsset } );
	const { result } = renderHook( () => useBuildHtmlPreview( reference, stream ) );
	await waitFor( () => expect( result.current.html ).toBe( payload.html ) );
	expect( result.current.assets ).toEqual( {} );
} );

it( 'accepts no assets from a feed whose snapshot URL is itself an asset path', async () => {
	// Without a /snapshot suffix there is no sibling to derive, and a path that
	// happened to equal the asset path would otherwise vouch for itself.
	respondWithAssets( { [ imageSource ]: imageAsset } );
	const view = {
		...stream,
		info: { ...stream.info, snapshotUrl: assetUrl( 'a'.repeat( 64 ) ).split( '?' )[ 0 ] },
	};
	const { result } = renderHook( () => useBuildHtmlPreview( reference, view ) );
	await waitFor( () => expect( result.current.html ).toBe( payload.html ) );
	expect( result.current.assets ).toEqual( {} );
} );
