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
	expect( doc.querySelectorAll( 'meta' ) ).toHaveLength( 1 );
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
