/** @jest-environment jsdom */

import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { BuildHtmlPreview } from '../stream/html-preview';
import { htmlPreviewDocument, preparePreviewDocument } from '../stream/html-preview-document';
import { createPreviewFrame, isPreviewFrameStatus } from '../stream/html-preview-frame';
import * as previewAssetLoader from '../stream/preview-asset-loader';
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

it( 'keeps links inert even when page CSS or re-parsed markup re-enables them', () => {
	const output = htmlPreviewDocument(
		`<html><head><style>html a{pointer-events:auto!important}</style></head><body>
		<a href="https://other.example"><span style="pointer-events:auto">Child</span></a>
		<math><mtext><table><mglyph><style><a href="https://other.example">Re-parsed</a></style></mglyph></table></mtext></math>
		</body></html>`
	);
	const doc = new DOMParser().parseFromString( output, 'text/html' );
	expect( doc.body.hasAttribute( 'inert' ) ).toBe( true );
	for ( const link of doc.querySelectorAll( 'a' ) ) {
		expect( link.closest( '[inert]' ) ).toBe( doc.body );
	}
} );

it( 'keeps dropped elements out when the frame re-parses the output', () => {
	const output = htmlPreviewDocument(
		`<html><body><h1>Hello</h1><form><math><mtext></form><form><mglyph><style></math>
		<img src="https://other.example/image"><meta http-equiv="refresh" content="0;url=https://other.example">
		<iframe srcdoc="unsafe"></iframe><link rel="preconnect" href="https://other.example">`
	);
	const doc = new DOMParser().parseFromString( output, 'text/html' );
	expect( doc.querySelector( 'h1' )?.textContent ).toBe( 'Hello' );
	expect( doc.querySelector( 'img, iframe, link, meta[http-equiv=refresh]' ) ).toBeNull();
	expect( '<!doctype html>' + doc.documentElement.outerHTML ).toBe( output );
} );

it( 'renders authored markup inert while dropping what loads or redirects', () => {
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
	expect( doc.querySelector( 'script, iframe, img, base, link, [src]' ) ).toBeNull();
	expect( doc.querySelector( 'a' )?.getAttribute( 'href' ) ).toBe( 'https://other.example' );
	expect( doc.querySelector( 'form input' ) ).not.toBeNull();
	expect( doc.querySelector( 'svg' ) ).not.toBeNull();
	expect( doc.body.hasAttribute( 'inert' ) ).toBe( true );
	expect( doc.head.firstElementChild?.getAttribute( 'http-equiv' ) ).toBe(
		'Content-Security-Policy'
	);
	expect( doc.querySelectorAll( 'meta' ) ).toHaveLength( 2 );
	expect( doc.querySelector( 'meta[name=referrer]' )?.getAttribute( 'content' ) ).toBe(
		'no-referrer'
	);
	expect( doc.querySelector( 'meta' )?.content ).toContain( "default-src 'none'" );
} );

it( 'keeps the navigation menu toggle whole so the page can style or hide it', () => {
	const html = `<!doctype html><html><head><style>h1 { color: red }</style></head><body>
		<nav data-dsl-element="navigation"><div class="studio-navigation">
			<button type="button" aria-label="Menu" aria-expanded="false"><span aria-hidden="true" class="studio-menu-icon">☰</span></button>
			<ul><li><a href="/flavors/">Flavors</a></li></ul>
		</div></nav><h1>Hello</h1></body></html>`;

	const rendered = new DOMParser().parseFromString( htmlPreviewDocument( html ), 'text/html' );
	expect(
		rendered.querySelector( '.studio-navigation > button .studio-menu-icon' )
	).not.toBeNull();
	expect( rendered.querySelector( '.studio-navigation li a' )?.getAttribute( 'href' ) ).toBe(
		'/flavors/'
	);

	const prepared = new DOMParser().parseFromString(
		preparePreviewDocument( html )!.html,
		'text/html'
	);
	expect(
		prepared.querySelector( '.studio-navigation > button .studio-menu-icon' )
	).not.toBeNull();
} );

const svgElements = ( doc: Document, name: string ) =>
	Array.from( doc.querySelectorAll( 'svg *' ) ).filter(
		( element ) => element.localName.toLowerCase() === name
	);
const previewSvg = ( svg: string ) =>
	new DOMParser().parseFromString(
		htmlPreviewDocument( `<html><head></head><body>${ svg }</body></html>` ),
		'text/html'
	);

it( 'keeps inline SVG icon sprites that reference the same document', () => {
	const doc = previewSvg(
		'<svg><symbol id="a" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></symbol></svg><svg><use href="#a"/></svg>'
	);
	expect( svgElements( doc, 'symbol' ) ).toHaveLength( 1 );
	const use = svgElements( doc, 'use' );
	expect( use ).toHaveLength( 1 );
	expect( use[ 0 ].getAttribute( 'href' ) ).toBe( '#a' );
} );

it( 'removes references to other documents from SVG elements that fetch them', () => {
	const doc = previewSvg(
		`<svg>
			<image href="https://other.example/a.png"/>
			<image xlink:href="https://other.example/b.png"/>
			<use href="https://other.example/sprite.svg#a"/>
			<use xlink:href="https://other.example/sprite.svg#a"/>
			<filter id="f"><feImage href="https://other.example/c.png"/></filter>
		</svg>`
	);
	for ( const name of [ 'image', 'use', 'feimage' ] ) {
		const elements = svgElements( doc, name );
		expect( elements.length ).toBeGreaterThan( 0 );
		for ( const element of elements ) {
			expect( element.hasAttribute( 'href' ) ).toBe( false );
			expect( element.hasAttribute( 'xlink:href' ) ).toBe( false );
		}
	}
	expect( doc.documentElement.outerHTML ).not.toContain( 'other.example' );
} );

it( 'removes script URLs from SVG links but keeps the link content', () => {
	const doc = previewSvg(
		'<svg><a href="javascript:alert(1)"><text>One</text></a><a xlink:href="javascript:alert(2)"><text>Two</text></a></svg>'
	);
	const links = svgElements( doc, 'a' );
	expect( links ).toHaveLength( 2 );
	for ( const link of links ) {
		expect( link.hasAttribute( 'href' ) ).toBe( false );
		expect( link.hasAttribute( 'xlink:href' ) ).toBe( false );
	}
	expect( doc.body.textContent ).toContain( 'One' );
	expect( doc.body.textContent ).toContain( 'Two' );
	expect( doc.documentElement.outerHTML ).not.toContain( 'javascript:' );
} );

it( 'rewrites network URLs in SVG style elements', () => {
	const doc = previewSvg(
		'<svg><style>.mark{fill:red;background:url(https://other.example/track)}</style><rect class="mark" width="10" height="10"/></svg>'
	);
	const style = svgElements( doc, 'style' );
	expect( style ).toHaveLength( 1 );
	expect( style[ 0 ].textContent ).toContain( 'fill:red' );
	expect( style[ 0 ].textContent ).toContain( 'url("")' );
	expect( doc.documentElement.outerHTML ).not.toContain( 'other.example' );
} );

it( 'uses an opaque frame with only a nonce-authorized bootstrap', async () => {
	global.fetch = jest.fn().mockResolvedValue( { ok: true, json: async () => payload } );
	render( <BuildHtmlPreview stream={ stream } isActive isGenerating isComplete={ false } /> );
	const iframe = await screen.findByTitle( 'Site preview' );
	expect( iframe.getAttribute( 'sandbox' ) ).toBe( 'allow-scripts' );
	expect( iframe.getAttribute( 'sandbox' ) ).not.toContain( 'allow-same-origin' );
	expect( iframe.getAttribute( 'srcdoc' ) ).toContain( "script-src 'nonce-" );
	expect( iframe.getAttribute( 'srcdoc' ) ).not.toContain( payload.html );
} );

it( 'loads the homepage and named companion routes concurrently without a picker', async () => {
	global.fetch = jest.fn().mockImplementation( async ( url: string ) => ( {
		ok: true,
		json: async () => ( { ...payload, route: new URL( url ).searchParams.get( 'route' ) } ),
	} ) );
	render(
		<BuildHtmlPreview
			isActive
			isGenerating
			isComplete={ false }
			stream={ {
				...stream,
				state: {
					...stream.state,
					plan: {
						status: 'developing',
						title: 'Test',
						direction: null,
						palette: null,
						typography: null,
						images: null,
						pages: [ { slug: 'about', title: 'Our story', sections: [] } ],
					},
					previews: { '/': reference, '/about/': { ...reference, route: '/about/' } },
				},
			} }
		/>
	);
	await waitFor( () =>
		expect( global.fetch ).toHaveBeenCalledWith(
			stream.info.previewUrl + '?run_id=run-1&route=%2Fabout%2F',
			expect.anything()
		)
	);
	expect( global.fetch ).toHaveBeenCalledWith(
		stream.info.previewUrl + '?run_id=run-1&route=%2F',
		expect.anything()
	);
	expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
} );

it( 'keeps the first non-home route from becoming the homepage', async () => {
	const onHomeReady = jest.fn();
	global.fetch = jest
		.fn()
		.mockResolvedValue( { ok: true, json: async () => ( { ...payload, route: '/about/' } ) } );
	render(
		<BuildHtmlPreview
			stream={ {
				...stream,
				state: { ...stream.state, previews: { '/about/': { ...reference, route: '/about/' } } },
			} }
			isActive
			isGenerating
			isComplete={ false }
			onHomeReady={ onHomeReady }
		/>
	);
	await screen.findByTitle( 'Site preview' );
	expect( onHomeReady ).not.toHaveBeenCalledWith( true );
} );

it( 'builds a fixed blob-only shell without generated content or external network access', () => {
	const first = createPreviewFrame();
	const second = createPreviewFrame();
	const doc = new DOMParser().parseFromString( first.srcDoc, 'text/html' );
	const script = doc.querySelector( 'script' )!;
	const policy = doc.querySelector( 'meta' )!.content;
	expect( doc.querySelectorAll( 'script' ) ).toHaveLength( 1 );
	expect( policy ).toContain( `script-src 'nonce-${ script.getAttribute( 'nonce' ) }'` );
	expect( policy ).toContain( 'img-src blob:' );
	expect( policy ).toContain( 'font-src blob:' );
	expect( policy ).toContain( "connect-src 'none'" );
	expect( policy ).not.toContain( 'https:' );
	expect( first.channel ).not.toBe( second.channel );
	expect( script.dataset.parentOrigin ).toBe( window.location.origin );
} );

it( 'accepts only bounded private-port statuses on the current channel', () => {
	expect(
		isPreviewFrameStatus( { v: 1, channel: 'current', type: 'status', homeReady: true }, 'current' )
	).toBe( true );
	expect(
		isPreviewFrameStatus( { v: 1, channel: 'stale', type: 'status', homeReady: true }, 'current' )
	).toBe( false );
	expect(
		isPreviewFrameStatus(
			{ v: 1, channel: 'current', type: 'status', homeReady: 'yes' },
			'current'
		)
	).toBe( false );
	expect(
		isPreviewFrameStatus(
			{ v: 1, channel: 'current', type: 'evicted', ids: [ 'a'.repeat( 64 ) ] },
			'current'
		)
	).toBe( true );
	expect(
		isPreviewFrameStatus(
			{ v: 1, channel: 'current', type: 'evicted', ids: Array( 97 ).fill( 'a'.repeat( 64 ) ) },
			'current'
		)
	).toBe( false );
	expect(
		isPreviewFrameStatus(
			{ v: 1, channel: 'current', type: 'rejected', ids: [ 'a'.repeat( 64 ) ] },
			'current'
		)
	).toBe( true );
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
	expect( doc.querySelector( '[srcset]' ) ).toBeNull();
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

it( 'sends only sanitized asset identities to the trusted runtime', () => {
	const prepared = preparePreviewDocument(
		`<html nonce="attacker"><head><style>:root{--hero:url('${ imageSource }')}</style><script nonce="attacker">alert(1)</script></head><body data-preview-loaded="forged"><header><h1>Brand header</h1></header><main class="site"><section id="welcome"><h1>A real homepage</h1><p>Enough actual content for a meaningful homepage preview.</p><img src="${ imageSource }" nonce="attacker" onerror="alert(1)" data-preview-image="forged"></section></main></body></html>`,
		{ [ imageSource ]: imageAsset }
	);
	expect( prepared?.meaningful ).toBe( true );
	const doc = new DOMParser().parseFromString( prepared!.html, 'text/html' );
	expect( doc.querySelector( 'script,[nonce],[data-preview-loaded],img[src]' ) ).toBeNull();
	expect( doc.querySelector( 'img' )?.getAttribute( 'data-preview-image' ) ).toBe( imageAsset.id );
	expect( prepared!.html ).toContain( `preview-asset:${ imageAsset.id }` );
	expect( prepared!.html ).not.toContain( 'token=' );
	expect(
		preparePreviewDocument(
			'<header><h1>A header by itself does not make a homepage preview.</h1></header>'
		)?.meaningful
	).toBe( false );
} );

it( 'preserves missing image slots and background references without allowing network URLs', () => {
	const html = `<html><head><style>.hero{background-image:url('${ imageSource }')}@font-face{font-family:Waiting;src:url('${ fontSource }')}</style></head><body><img class="product" src="${ imageSource }" width="400" height="300" alt="Sourdough" data-preview-loaded="forged" onerror="alert(1)"><div style="background:url(https://evil.example/track)"></div></body></html>`;
	const pending = preparePreviewDocument( html )!;
	const doc = new DOMParser().parseFromString( pending.html, 'text/html' );
	const image = doc.querySelector( 'img' )!;
	expect( image.hasAttribute( 'data-preview-pending' ) ).toBe( true );
	expect( image.getAttribute( 'width' ) ).toBe( '400' );
	expect( image.getAttribute( 'height' ) ).toBe( '300' );
	expect( image.getAttribute( 'alt' ) ).toBe( 'Sourdough' );
	expect( doc.querySelector( '[src],[data-preview-loaded]' ) ).toBeNull();
	expect( pending.html ).toContain( 'preview-pending:image' );
	expect( pending.html ).not.toContain( 'evil.example' );
	expect( pending.html ).not.toContain( fontSource );
	const loaded = preparePreviewDocument( html, { [ imageSource ]: imageAsset } )!;
	const next = new DOMParser().parseFromString( loaded.html, 'text/html' );
	expect( next.querySelector( 'img' )?.getAttribute( 'data-preview-image' ) ).toBe( imageAsset.id );
	expect( next.querySelector( 'img[data-preview-pending]' ) ).toBeNull();
	expect( loaded.html ).not.toContain( 'token=' );
} );

it( 'keeps a slow asset request alive across document revisions and aborts on route unmount', async () => {
	const load = jest.fn().mockReturnValue( new Promise( () => {} ) );
	const factory = jest
		.spyOn( previewAssetLoader, 'createPreviewAssetLoader' )
		.mockReturnValue( { load, dispose: jest.fn() } );
	global.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		json: async () => ( { ...payload, assets: { [ imageSource ]: imageAsset } } ),
	} );
	const { rerender, unmount } = render(
		<BuildHtmlPreview stream={ stream } isActive isGenerating isComplete={ false } />
	);
	await waitFor( () => expect( load ).toHaveBeenCalledTimes( 1 ) );
	const signal = load.mock.calls[ 0 ][ 1 ] as AbortSignal;
	rerender(
		<BuildHtmlPreview
			stream={ {
				...stream,
				state: {
					...stream.state,
					previews: { '/': { ...reference, documentId: 'b'.repeat( 64 ) } },
				},
			} }
			isActive
			isGenerating
			isComplete={ false }
		/>
	);
	await waitFor( () => expect( global.fetch ).toHaveBeenCalledTimes( 2 ) );
	expect( signal.aborted ).toBe( false );
	expect( load ).toHaveBeenCalledTimes( 1 );
	unmount();
	expect( signal.aborted ).toBe( true );
	factory.mockRestore();
} );

it( 'reports the generated images it loads, and releases them with the scene', async () => {
	const created = jest.fn( () => 'blob:preview-image' );
	const revoked = jest.fn();
	Object.assign( URL, { createObjectURL: created, revokeObjectURL: revoked } );
	const load = jest.fn().mockImplementation( async ( request: Record< string, unknown > ) => {
		const source = Object.keys( request )[ 0 ];
		return source === imageSource
			? { [ source ]: { id: imageAsset.id, mimeType: 'image/png', bytes: new ArrayBuffer( 4 ) } }
			: { [ source ]: { id: fontAsset.id, mimeType: 'font/woff2', bytes: new ArrayBuffer( 4 ) } };
	} );
	const factory = jest
		.spyOn( previewAssetLoader, 'createPreviewAssetLoader' )
		.mockReturnValue( { load, dispose: jest.fn() } );
	global.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		json: async () => ( {
			...payload,
			assets: { [ imageSource ]: imageAsset, [ fontSource ]: fontAsset },
		} ),
	} );
	const onImages = jest.fn();
	const { unmount } = render(
		<BuildHtmlPreview
			isActive
			isComplete={ false }
			isGenerating
			onImages={ onImages }
			stream={ stream }
		/>
	);
	await waitFor( () =>
		expect( onImages ).toHaveBeenCalledWith( { [ imageSource ]: 'blob:preview-image' } )
	);
	expect( created ).toHaveBeenCalledTimes( 1 );
	expect( onImages ).not.toHaveBeenCalledWith(
		expect.objectContaining( { [ fontSource ]: expect.anything() } )
	);
	unmount();
	expect( revoked ).toHaveBeenCalledWith( 'blob:preview-image' );
	expect( onImages ).toHaveBeenLastCalledWith( {} );
	factory.mockRestore();
} );

it( 'offers a declined asset again only after capacity frees, within a budget', async () => {
	const loaded = { id: imageAsset.id, mimeType: 'image/png', bytes: new ArrayBuffer( 1 ) };
	const load = jest.fn().mockImplementation( async () => ( {
		[ imageSource ]: { ...loaded, bytes: new ArrayBuffer( 1 ) },
	} ) );
	const factory = jest
		.spyOn( previewAssetLoader, 'createPreviewAssetLoader' )
		.mockReturnValue( { load, dispose: jest.fn() } );
	const port = {
		onmessage: null as ( ( event: MessageEvent ) => void ) | null,
		postMessage: jest.fn(),
		start: jest.fn(),
		close: jest.fn(),
	};
	const previousChannel = global.MessageChannel;
	global.MessageChannel = class {
		port1 = port;
		port2 = {};
	} as unknown as typeof MessageChannel;
	const contentWindow = jest
		.spyOn( HTMLIFrameElement.prototype, 'contentWindow', 'get' )
		.mockReturnValue( { postMessage: jest.fn() } as unknown as Window );
	global.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		json: async () => ( {
			...payload,
			html: `<html><body><main class="site"><section id="welcome"><h1>A real homepage</h1><p>Enough actual content for a meaningful homepage preview.</p><img src="${ imageSource }"></section></main></body></html>`,
			assets: { [ imageSource ]: imageAsset },
		} ),
	} );
	const { rerender } = render(
		<BuildHtmlPreview stream={ stream } isActive isGenerating isComplete={ false } />
	);
	const iframe = await screen.findByTitle( 'Site preview' );
	const channel = new DOMParser()
		.parseFromString( iframe.getAttribute( 'srcdoc' )!, 'text/html' )
		.querySelector( 'script' )!.dataset.channel!;
	const reply = ( data: Record< string, unknown > ) =>
		act( () =>
			port.onmessage?.( new MessageEvent( 'message', { data: { v: 1, channel, ...data } } ) )
		);
	act( () => iframe.dispatchEvent( new Event( 'load' ) ) );
	await reply( { type: 'ready' } );
	await waitFor( () =>
		expect( port.postMessage ).toHaveBeenCalledWith(
			expect.objectContaining( { type: 'assets' } ),
			expect.anything()
		)
	);
	const loads = () => load.mock.calls.length;
	const before = loads();
	await reply( { type: 'rejected', ids: [ imageAsset.id ] } );
	rerender(
		<BuildHtmlPreview
			stream={ {
				...stream,
				state: {
					...stream.state,
					previews: { '/': { ...reference, documentId: 'b'.repeat( 64 ) } },
				},
			} }
			isActive
			isGenerating
			isComplete={ false }
		/>
	);
	await waitFor( () => expect( global.fetch ).toHaveBeenCalledTimes( 2 ) );
	expect( loads() ).toBe( before );
	await reply( { type: 'evicted', ids: [ 'c'.repeat( 64 ) ] } );
	await waitFor( () => expect( loads() ).toBe( before + 1 ) );
	for ( let attempt = 0; attempt < 3; attempt++ ) {
		await reply( { type: 'rejected', ids: [ imageAsset.id ] } );
		await reply( { type: 'evicted', ids: [ 'c'.repeat( 64 ) ] } );
	}
	await waitFor( () => expect( loads() ).toBe( before + 3 ) );
	await reply( { type: 'evicted', ids: [ 'c'.repeat( 64 ) ] } );
	expect( loads() ).toBe( before + 3 );
	contentWindow.mockRestore();
	global.MessageChannel = previousChannel;
	factory.mockRestore();
} );

it( 'waits for fetched readiness and refetches when ready changes without an HTML revision', async () => {
	global.fetch = jest
		.fn()
		.mockResolvedValue( { ok: true, json: async () => ( { ...payload, ready: false } ) } );
	const { result, rerender } = renderHook( ( ref ) => useBuildHtmlPreview( ref, stream ), {
		initialProps: reference,
	} );
	await waitFor( () => expect( result.current.html ).toBe( payload.html ) );
	let resolve: ( value: unknown ) => void = () => {};
	global.fetch = jest.fn().mockReturnValue(
		new Promise( ( done ) => {
			resolve = done;
		} )
	);
	rerender( { ...reference, ready: true } );
	await waitFor( () => expect( global.fetch ).toHaveBeenCalledTimes( 1 ) );
	expect( result.current.ready ).toBe( false );
	await act( async () => {
		resolve( { ok: true, json: async () => ( { ...payload, ready: true } ) } );
	} );
	await waitFor( () => expect( result.current.ready ).toBe( true ) );
} );
