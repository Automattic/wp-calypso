/** @jest-environment jsdom */

import { act, render, screen } from '@testing-library/react';
import { BuildHtmlPreviewFallback } from '../stream/html-preview-fallback';
import { initialStreamState } from '../stream/reducer';
import type { StreamPreview } from '../stream/reducer';
import type { BuildWowStreamView } from '../stream/use-build-wow-stream';

const reference = ( route = '/', epoch = '1:1' ): StreamPreview => ( {
	route,
	epoch,
	documentId: 'a'.repeat( 64 ),
	ready: false,
} );
const stream: BuildWowStreamView = {
	info: {
		protocol: 1,
		blogId: 123,
		runId: 'run-1',
		capabilities: [ 'preview:dsl-html' ],
		eventsUrl: 'https://public-api.wordpress.com/events',
		snapshotUrl: 'https://public-api.wordpress.com/snapshot',
		previewUrl: 'https://public-api.wordpress.com/preview',
	},
	state: {
		...initialStreamState( 'run-1' ),
		plan: {
			status: 'completed',
			title: 'Bakery',
			direction: null,
			palette: null,
			typography: null,
			images: null,
			pages: [
				{ slug: 'home', title: 'Home', sections: [ 'Welcome' ] },
				{ slug: 'our-story', title: 'Our Story', sections: [ 'Introduction' ] },
				{ slug: 'location', title: 'Location', sections: [ 'Visit' ] },
			],
		},
		previews: { '/': reference(), '/our-story/': reference( '/our-story/' ) },
	},
	authorize: async () => 'Bearer site-token',
};
const content =
	'<main class="site"><section id="welcome"><h1>A warm welcome to our bakery</h1><p>Good things are taking shape here.</p></section></main>';
const originalFetch = global.fetch;
let fetchMock: jest.Mock;

function documentResponse( route: string, html = content, runId = 'run-1', epoch = '1:1' ) {
	return {
		ok: true,
		json: async () => ( {
			v: 1,
			run_id: runId,
			epoch,
			route,
			document_id: 'b'.repeat( 64 ),
			format: 'dsl-html',
			html: `<html><head></head><body>${ html }</body></html>`,
			assets: {},
		} ),
	};
}

beforeEach( () => {
	fetchMock = jest
		.fn()
		.mockImplementation( async ( url: string ) =>
			documentResponse( new URL( url ).searchParams.get( 'route' )! )
		);
	global.fetch = fetchMock;
} );

afterEach( () => {
	global.fetch = originalFetch;
	jest.useRealTimers();
} );

it( 'shows the homepage first and actual named pages without a selector', async () => {
	render( <BuildHtmlPreviewFallback stream={ stream } /> );
	await screen.findByTitle( 'Homepage — static preview' );
	await screen.findByTitle( 'Our Story — static preview' );
	expect( screen.getAllByRole( 'heading' ).map( ( heading ) => heading.textContent ) ).toEqual( [
		'Homepage',
		'Our Story',
	] );
	expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
	expect( screen.queryByRole( 'heading', { name: 'Location' } ) ).not.toBeInTheDocument();
	expect( screen.getByText( 'Showing a simplified preview of your site.' ) ).toBeVisible();
} );

it( 'blocks scripts, active markup and external resources in opaque scriptless frames', async () => {
	fetchMock.mockImplementation( async ( url: string ) =>
		documentResponse(
			new URL( url ).searchParams.get( 'route' )!,
			content +
				'<script>parent.alert(1)</script><img src="https://evil.example/image" onerror="alert(1)"><a href="https://evil.example">Link</a>'
		)
	);
	render( <BuildHtmlPreviewFallback stream={ stream } /> );
	const iframe = await screen.findByTitle( 'Homepage — static preview' );
	expect( iframe.getAttribute( 'sandbox' ) ).toBe( '' );
	expect( iframe.getAttribute( 'referrerpolicy' ) ).toBe( 'no-referrer' );
	const doc = new DOMParser().parseFromString( iframe.getAttribute( 'srcdoc' )!, 'text/html' );
	expect( doc.querySelector( 'script, img' ) ).toBeNull();
	expect( doc.body.hasAttribute( 'inert' ) ).toBe( true );
	expect(
		doc.querySelector( 'meta[http-equiv="Content-Security-Policy"]' )?.getAttribute( 'content' )
	).toContain( "script-src 'none'" );
	expect( doc.querySelector( 'h1' )?.textContent ).toBe( 'A warm welcome to our bakery' );
} );

it( 'never fetches templates or routes absent from the plan', async () => {
	render(
		<BuildHtmlPreviewFallback
			stream={ {
				...stream,
				state: {
					...stream.state,
					previews: {
						...stream.state.previews,
						'/_templates/page/': reference( '/_templates/page/' ),
						'/unplanned/': reference( '/unplanned/' ),
					},
				},
			} }
		/>
	);
	await screen.findByTitle( 'Our Story — static preview' );
	expect(
		fetchMock.mock.calls.map( ( [ url ] ) => new URL( url ).searchParams.get( 'route' ) )
	).toEqual( [ '/', '/our-story/' ] );
} );

it( 'keeps a waiting homepage when a secondary page arrives first', async () => {
	render(
		<BuildHtmlPreviewFallback
			stream={ {
				...stream,
				state: { ...stream.state, previews: { '/our-story/': reference( '/our-story/' ) } },
			} }
		/>
	);
	await screen.findByTitle( 'Our Story — static preview' );
	expect( screen.queryByTitle( 'Homepage — static preview' ) ).not.toBeInTheDocument();
	expect(
		screen.getByText( 'Your homepage preview will appear when it is available.' )
	).toBeVisible();
} );

it( 'does not present header-only or omitted documents as available pages', async () => {
	fetchMock.mockImplementation( async ( url: string ) =>
		documentResponse(
			new URL( url ).searchParams.get( 'route' )!,
			'<header><h1>A very long brand name for a bakery</h1><p>A lovely place to gather.</p></header>'
		)
	);
	const { rerender } = render( <BuildHtmlPreviewFallback stream={ stream } /> );
	await act( async () => {} );
	expect( screen.queryByTitle( 'Our Story — static preview' ) ).not.toBeInTheDocument();
	expect( screen.queryByTitle( 'Homepage — static preview' ) ).not.toBeInTheDocument();
	fetchMock.mockImplementation( async ( url: string ) =>
		documentResponse(
			new URL( url ).searchParams.get( 'route' )!,
			'Preview omitted: HTML exceeded the cap.'
		)
	);
	rerender(
		<BuildHtmlPreviewFallback
			stream={ {
				...stream,
				state: {
					...stream.state,
					previews: { '/': { ...reference(), documentId: 'c'.repeat( 64 ) } },
				},
			} }
		/>
	);
	await act( async () => {} );
	expect( screen.queryByTitle( 'Homepage — static preview' ) ).not.toBeInTheDocument();
} );

it( 'retains the last valid document through failed updates', async () => {
	jest.useFakeTimers();
	const { rerender } = render( <BuildHtmlPreviewFallback stream={ stream } /> );
	const iframe = await screen.findByTitle( 'Homepage — static preview' );
	const previous = iframe.getAttribute( 'srcdoc' );
	fetchMock.mockRejectedValue( new Error( 'Offline' ) );
	rerender(
		<BuildHtmlPreviewFallback
			stream={ {
				...stream,
				state: {
					...stream.state,
					previews: { '/': { ...reference(), documentId: 'c'.repeat( 64 ) } },
				},
			} }
		/>
	);
	await act( async () => {
		await jest.advanceTimersByTimeAsync( 8000 );
	} );
	expect( screen.getByTitle( 'Homepage — static preview' ) ).toBe( iframe );
	expect( iframe.getAttribute( 'srcdoc' ) ).toBe( previous );
	expect(
		screen.getByText( 'This preview could not be updated. Showing the last available version.' )
	).toBeVisible();
} );

it( 'clears the old document immediately on a run or epoch change', async () => {
	const { rerender } = render( <BuildHtmlPreviewFallback stream={ stream } /> );
	await screen.findByTitle( 'Homepage — static preview' );
	fetchMock.mockReturnValue( new Promise( () => {} ) );
	rerender(
		<BuildHtmlPreviewFallback stream={ { ...stream, info: { ...stream.info, runId: 'run-2' } } } />
	);
	expect( screen.queryByTitle( 'Homepage — static preview' ) ).not.toBeInTheDocument();
	expect( screen.queryByTitle( 'Our Story — static preview' ) ).not.toBeInTheDocument();
	fetchMock.mockImplementation( async ( url: string ) =>
		documentResponse( new URL( url ).searchParams.get( 'route' )! )
	);
	rerender( <BuildHtmlPreviewFallback stream={ stream } /> );
	await screen.findByTitle( 'Homepage — static preview' );
	fetchMock.mockReturnValue( new Promise( () => {} ) );
	rerender(
		<BuildHtmlPreviewFallback
			stream={ {
				...stream,
				state: { ...stream.state, previews: { '/': reference( '/', '1:2' ) } },
			} }
		/>
	);
	expect( screen.queryByTitle( 'Homepage — static preview' ) ).not.toBeInTheDocument();
} );
