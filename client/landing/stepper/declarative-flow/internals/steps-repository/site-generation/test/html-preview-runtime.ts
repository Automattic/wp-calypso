/** @jest-environment jsdom */
import { preparePreviewDocument } from '../stream/html-preview-document';
import { HTML_PREVIEW_RUNTIME } from '../stream/html-preview-runtime';

type TestPort = {
	onmessage: ( ( event: MessageEvent ) => void ) | null;
	postMessage: jest.Mock;
	start: jest.Mock;
	close: jest.Mock;
};

const channel = 'private-channel';
let port: TestPort;
let roots: ShadowRoot[];
let restoreScript: PropertyDescriptor | undefined;
let previousMatchMedia: typeof window.matchMedia;
let previousObserver: typeof ResizeObserver;
let previousReplaceSync: PropertyDescriptor | undefined;

beforeEach( () => {
	jest.useFakeTimers();
	roots = [];
	port = { onmessage: null, postMessage: jest.fn(), start: jest.fn(), close: jest.fn() };
	const script = document.createElement( 'script' );
	script.dataset.channel = channel;
	script.dataset.parentOrigin = window.location.origin;
	restoreScript = Object.getOwnPropertyDescriptor( document, 'currentScript' );
	Object.defineProperty( document, 'currentScript', { configurable: true, value: script } );
	previousMatchMedia = window.matchMedia;
	window.matchMedia = jest.fn().mockReturnValue( { matches: true, addEventListener: jest.fn() } );
	previousReplaceSync = Object.getOwnPropertyDescriptor( CSSStyleSheet.prototype, 'replaceSync' );
	Object.defineProperty( CSSStyleSheet.prototype, 'replaceSync', {
		configurable: true,
		value: () => {},
	} );
	previousObserver = global.ResizeObserver;
	global.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
	const attach = Element.prototype.attachShadow;
	jest.spyOn( Element.prototype, 'attachShadow' ).mockImplementation( function (
		this: Element,
		options: ShadowRootInit
	) {
		const root = attach.call( this, options );
		roots.push( root );
		return root;
	} );
	window.eval( HTML_PREVIEW_RUNTIME );
} );

afterEach( () => {
	window.dispatchEvent( new Event( 'pagehide' ) );
	jest.restoreAllMocks();
	jest.useRealTimers();
	window.matchMedia = previousMatchMedia;
	global.ResizeObserver = previousObserver;
	if ( previousReplaceSync ) {
		Object.defineProperty( CSSStyleSheet.prototype, 'replaceSync', previousReplaceSync );
	} else {
		Reflect.deleteProperty( CSSStyleSheet.prototype, 'replaceSync' );
	}
	if ( restoreScript ) {
		Object.defineProperty( document, 'currentScript', restoreScript );
	} else {
		Reflect.deleteProperty( document, 'currentScript' );
	}
	document.body.replaceChildren();
} );

function connect( source = window.parent, key = channel, origin = window.location.origin ) {
	window.dispatchEvent(
		new MessageEvent( 'message', {
			source,
			origin,
			data: { v: 1, channel: key, type: 'connect' },
			ports: [ port as unknown as MessagePort ],
		} )
	);
}

function send( data: Record< string, unknown > ) {
	port.onmessage?.( new MessageEvent( 'message', { data: { v: 1, channel, ...data } } ) );
}

function render( revision: number, content: string, epoch = '1:1' ) {
	const prepared = preparePreviewDocument( content )!;
	send( { type: 'render', route: '/', title: 'Home', epoch, revision, html: prepared.html } );
}

const first =
	'<main class="site"><section id="welcome"><h1>A meaningful first homepage</h1><p>Real generated content, available before images or later sections.</p></section></main>';

it( 'binds its one private port only to the parent, origin and current channel', () => {
	connect( window.parent, 'wrong-channel' );
	connect( window.parent, channel, 'https://other.example' );
	connect( {} as Window );
	expect( port.postMessage ).not.toHaveBeenCalled();
	connect();
	expect( port.postMessage ).toHaveBeenCalledTimes( 1 );
	expect( port.postMessage ).toHaveBeenCalledWith( { v: 1, channel, type: 'ready' } );
	connect();
	expect( port.postMessage ).toHaveBeenCalledTimes( 1 );
} );

it( 'renders an inactive homepage and reports readiness without an animation frame', () => {
	connect();
	render( 1, first );
	expect( roots ).toHaveLength( 1 );
	expect( roots[ 0 ].host.shadowRoot ).toBeNull();
	expect( roots[ 0 ].querySelector( '#welcome' ) ).not.toBeNull();
	expect( port.postMessage ).toHaveBeenCalledWith( {
		v: 1,
		channel,
		type: 'status',
		homeReady: true,
	} );
} );

it( 'preserves existing sections when shared chrome arrives, and rejects stale revisions and epochs', () => {
	connect();
	render( 1, first );
	const hero = roots[ 0 ].querySelector( '#welcome' );
	render(
		2,
		'<header><p>Late shared chrome</p></header>' +
			first.replace(
				'</main>',
				'<section id="details"><h2>More content</h2><p>A second real section.</p></section></main>'
			)
	);
	expect( roots[ 0 ].querySelector( '#welcome' ) ).toBe( hero );
	expect( roots[ 0 ].querySelector( '#details' ) ).not.toBeNull();
	render( 1, first );
	expect( roots[ 0 ].querySelector( '#details' ) ).not.toBeNull();
	render( 3, first, '1:2' );
	expect( roots ).toHaveLength( 2 );
	render( 4, first, '1:1' );
	expect( roots ).toHaveLength( 2 );
} );

it( 'keeps abstract loading tails outside actual documents and stops them from host completion only', () => {
	connect();
	send( { type: 'config', active: false, generating: true, complete: false } );
	render( 1, first );
	const tail = document.querySelector( '.preview-tail' )!;
	expect( roots[ 0 ].querySelector( '.preview-tail' ) ).toBeNull();
	expect( tail.children ).toHaveLength( 2 );
	expect( tail.hasAttribute( 'hidden' ) ).toBe( false );
	send( { type: 'config', active: false, generating: false, complete: true } );
	expect( tail.hasAttribute( 'hidden' ) ).toBe( true );
	expect( document.querySelector( '.completion-gloss' ) ).toBeNull();
} );

const assetId = ( index: number ) => index.toString( 16 ).padStart( 64, '0' );

function asset( id: string, mimeType = 'font/woff2' ) {
	return { id, mimeType, bytes: new ArrayBuffer( 1 ) };
}

function sentOfType( type: string ) {
	return port.postMessage.mock.calls
		.map( ( [ message ] ) => message )
		.filter( ( message ) => message.type === type );
}

async function settle() {
	for ( let index = 0; index < 10; index++ ) {
		await Promise.resolve();
	}
}

function useMotion() {
	( window.matchMedia as jest.Mock ).mock.results[ 0 ].value.matches = false;
}

describe( 'assets and completion', () => {
	let createObjectURL: PropertyDescriptor | undefined;
	let revokeObjectURL: PropertyDescriptor | undefined;

	beforeEach( () => {
		createObjectURL = Object.getOwnPropertyDescriptor( URL, 'createObjectURL' );
		revokeObjectURL = Object.getOwnPropertyDescriptor( URL, 'revokeObjectURL' );
		let next = 0;
		Object.defineProperty( URL, 'createObjectURL', {
			configurable: true,
			value: () => `blob:asset-${ next++ }`,
		} );
		Object.defineProperty( URL, 'revokeObjectURL', { configurable: true, value: () => {} } );
	} );

	afterEach( () => {
		window.dispatchEvent( new Event( 'pagehide' ) );
		for ( const [ name, descriptor ] of [
			[ 'createObjectURL', createObjectURL ],
			[ 'revokeObjectURL', revokeObjectURL ],
		] as const ) {
			if ( descriptor ) {
				Object.defineProperty( URL, name, descriptor );
			} else {
				Reflect.deleteProperty( URL, name );
			}
		}
	} );

	it( 'acknowledges assets it cannot hold and frees capacity when the roster changes', () => {
		connect();
		const ids = Array.from( { length: 97 }, ( _, index ) => assetId( index + 1 ) );
		send( {
			type: 'render',
			route: '/',
			title: 'Home',
			epoch: '1:1',
			revision: 1,
			html: `<main class="site"><section id="welcome"><h1>Assets</h1><p>${ ids.join( ' ' ) }</p></section></main>`,
		} );
		for ( const id of ids.slice( 0, 96 ) ) {
			send( { type: 'assets', assets: [ asset( id ) ] } );
		}
		expect( sentOfType( 'rejected' ) ).toHaveLength( 0 );
		send( { type: 'assets', assets: [ asset( ids[ 96 ] ) ] } );
		expect( sentOfType( 'rejected' ) ).toEqual( [
			expect.objectContaining( { ids: [ ids[ 96 ] ] } ),
		] );
		send( { type: 'assets', assets: [ { id: 'not-an-id', mimeType: 'font/woff2' } ] } );
		expect( sentOfType( 'rejected' ) ).toHaveLength( 1 );
		send( { type: 'routes', routes: [ '/about/' ] } );
		expect( sentOfType( 'evicted' ) ).toEqual( [
			expect.objectContaining( { ids: ids.slice( 0, 96 ) } ),
		] );
	} );

	async function completeWith( html: string ) {
		connect();
		send( { type: 'config', active: false, generating: false, complete: false } );
		send( { type: 'render', route: '/', title: 'Home', epoch: '1:1', revision: 1, html } );
		send( { type: 'config', active: true, generating: false, complete: true } );
		await settle();
	}

	const imagePage = `<main class="site"><section id="welcome"><h1>A meaningful first homepage</h1><p>Real generated content with an image.</p><img data-preview-image="${ assetId(
		1
	) }" alt=""></section></main>`;

	it( 'treats a failed image as settled for the completion cue', async () => {
		await completeWith( imagePage );
		expect( document.querySelector( '.is-polished' ) ).toBeNull();
		roots[ 0 ].querySelector( 'img' )!.dispatchEvent( new Event( 'error' ) );
		jest.advanceTimersByTime( 20 );
		expect( document.querySelector( '.is-polished' ) ).not.toBeNull();
	} );

	it( 'bounds the wait for a missing image so the cue starts before the host redirect', async () => {
		await completeWith( imagePage );
		jest.advanceTimersByTime( 1200 );
		expect( document.querySelector( '.is-polished' ) ).toBeNull();
		jest.advanceTimersByTime( 100 );
		expect( document.querySelector( '.is-polished' ) ).not.toBeNull();
	} );

	it( 'keeps only namespaced font faces, so non-ASCII families cannot collide across pages', () => {
		Object.defineProperty( CSSStyleSheet.prototype, 'replaceSync', {
			configurable: true,
			value( this: CSSStyleSheet, text: string ) {
				const element = document.createElement( 'style' );
				element.textContent = text;
				document.body.append( element );
				Object.defineProperty( this, 'cssRules', {
					configurable: true,
					value: element.sheet!.cssRules,
				} );
				element.remove();
			},
		} );
		connect();
		send( {
			type: 'render',
			route: '/',
			title: 'Home',
			epoch: '1:1',
			revision: 1,
			html: `<html><head><style>@font-face{font-family:"Café";font-weight:400}@font-face{font-family:Inter;font-weight:400;font-display:swap;src:url("blob:font-fixture") format("woff2");unicode-range:U+0000-00FF}h1{font-family:Inter,serif}</style></head><body>${ first }</body></html>`,
		} );
		const fonts = Array.from( document.head.querySelectorAll( 'style' ) )
			.map( ( element ) => element.textContent )
			.join( '\n' );
		expect( fonts ).toMatch( /@font-face\s*{[^}]*preview-/ );
		expect( fonts ).not.toContain( 'Café' );
		expect( fonts ).toContain( 'blob:font-fixture' );
		expect( fonts ).toMatch( /font-display:\s*swap/ );
		expect( fonts ).toMatch( /unicode-range:\s*U\+0000-00FF/ );
		expect( fonts ).not.toMatch( /font-family:\s*"?Inter/ );
	} );

	it( 'decodes a late background before using it, then reveals that element once', async () => {
		useMotion();
		let decoded: () => void = () => {};
		const decode = jest.fn( () => new Promise< void >( ( resolve ) => ( decoded = resolve ) ) );
		Object.defineProperty( HTMLImageElement.prototype, 'decode', {
			configurable: true,
			value: decode,
		} );
		const animate = jest.fn( () => ( { finished: Promise.resolve(), cancel: jest.fn() } ) );
		Object.defineProperty( Element.prototype, 'animate', { configurable: true, value: animate } );
		const id = assetId( 7 );
		connect();
		send( { type: 'config', active: false, generating: true, complete: false } );
		send( {
			type: 'render',
			route: '/',
			title: 'Home',
			epoch: '1:1',
			revision: 1,
			html: `<main class="site"><section id="welcome"><h1>A meaningful first homepage</h1><p>Real generated content before its background.</p><div id="hero" style="background-image:url(preview-asset:${ id })"></div></section></main>`,
		} );
		send( { type: 'config', active: true, generating: true, complete: false } );
		send( { type: 'assets', assets: [ asset( id, 'image/png' ) ] } );
		const hero = roots[ 0 ].querySelector( '#hero' ) as HTMLElement;
		expect( hero.getAttribute( 'style' ) ).not.toContain( 'blob:' );
		expect( animate ).not.toHaveBeenCalled();
		decoded();
		await settle();
		expect( hero.getAttribute( 'style' ) ).toContain( 'blob:asset-0' );
		expect( animate ).toHaveBeenCalledTimes( 1 );
		expect( animate.mock.contexts[ 0 ] ).toBe( hero );
		send( { type: 'assets', assets: [ asset( assetId( 8 ) ) ] } );
		await settle();
		expect( animate ).toHaveBeenCalledTimes( 1 );
		Reflect.deleteProperty( HTMLImageElement.prototype, 'decode' );
		Reflect.deleteProperty( Element.prototype, 'animate' );
	} );
} );

describe( 'responsive page composition', () => {
	function sizeScene( width: number, height: number ) {
		const viewport = document.querySelector( '.preview-viewport' )!;
		Object.defineProperty( viewport, 'clientWidth', { configurable: true, value: width } );
		Object.defineProperty( viewport, 'clientHeight', { configurable: true, value: height } );
	}

	function positions() {
		return Array.from( document.querySelectorAll< HTMLElement >( '.preview-page' ) ).map(
			( element ) => {
				const [ x, y, scale ] = element.style.transform.match( /[\d.]+/g )!.map( Number );
				return { x, y, width: 1040 * scale, scale };
			}
		);
	}

	function addPages( count: number ) {
		connect();
		render( 1, first );
		for ( let index = 1; index <= count; index++ ) {
			send( {
				type: 'render',
				route: `/page-${ index }/`,
				title: `Page ${ index }`,
				epoch: '1:1',
				revision: 1,
				html: preparePreviewDocument( first )!.html,
			} );
		}
		roots.forEach( ( root, index ) => {
			Object.defineProperty( root.firstElementChild, 'offsetHeight', {
				configurable: true,
				value: index === 0 ? 3200 : 1200 + index * 100,
			} );
		} );
		send( { type: 'config', active: false, generating: false, complete: false } );
	}

	it.each( [ 720, 1090, 1570 ] )(
		'keeps the home and companion pages grouped at width %i',
		( width ) => {
			sizeScene( width, 800 );
			addPages( 3 );
			const [ home, ...companions ] = positions();
			expect( home.x ).toBe( 0 );
			expect( home.width ).toBeGreaterThan( Math.min( 600, width / 2 ) );
			expect( companions[ 0 ].y ).toBe( home.y );
			companions.forEach( ( page ) => {
				expect( page.x - home.width ).toBeCloseTo( 32 );
				expect( page.x + page.width ).toBeLessThanOrEqual( width );
			} );
			companions.slice( 1 ).forEach( ( page, index ) => {
				const previous = companions[ index ];
				expect( page.y - ( previous.y + ( 1300 + index * 100 ) * previous.scale ) ).toBeCloseTo(
					56
				);
			} );
			const scene = document.querySelector< HTMLElement >( '.preview-scene' )!;
			expect( parseFloat( scene.style.height ) ).toBeGreaterThanOrEqual(
				home.y + 3200 * home.scale
			);
		}
	);

	it( 'uses the full mobile width and keeps every companion below the homepage', () => {
		sizeScene( 350, 700 );
		addPages( 6 );
		const [ home, ...companions ] = positions();
		expect( home.x ).toBe( 0 );
		expect( home.width ).toBeCloseTo( 350 );
		companions.forEach( ( page ) => {
			expect( page.y ).toBeGreaterThan( home.y + 3200 * home.scale );
			expect( page.x + page.width ).toBeLessThanOrEqual( 350 );
		} );
	} );
} );
