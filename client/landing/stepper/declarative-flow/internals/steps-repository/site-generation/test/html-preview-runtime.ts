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

it( 'keeps an image slot in place as its asset becomes available, without replacing the section', () => {
	connect();
	const source = '/wp-content/themes/test/assets/bread.png';
	const html = first.replace(
		'</section>',
		`<img src="${ source }" width="400" height="300" alt="Bread"></section>`
	);
	render( 1, html );
	const section = roots[ 0 ].querySelector( '#welcome' );
	const image = roots[ 0 ].querySelector( 'img' )!;
	expect( image.hasAttribute( 'data-preview-pending' ) ).toBe( true );
	const prepared = preparePreviewDocument( html, {
		[ source ]: { id: 'a'.repeat( 64 ), mime_type: 'image/png', url: 'https://example.com/asset' },
	} )!;
	send( {
		type: 'render',
		route: '/',
		title: 'Home',
		epoch: '1:1',
		revision: 2,
		html: prepared.html,
	} );
	expect( roots[ 0 ].querySelector( '#welcome' ) ).toBe( section );
	expect( roots[ 0 ].querySelector( 'img' ) ).toBe( image );
	expect( image.hasAttribute( 'data-preview-pending' ) ).toBe( false );
	expect( image.getAttribute( 'data-preview-image' ) ).toBe( 'a'.repeat( 64 ) );
	expect( image.getAttribute( 'width' ) ).toBe( '400' );
	expect( image.getAttribute( 'height' ) ).toBe( '300' );
	expect( image.hasAttribute( 'src' ) ).toBe( false );
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
		if ( count > 0 ) {
			send( {
				type: 'render',
				route: '/',
				title: 'Home',
				epoch: '1:1',
				revision: 2,
				html: preparePreviewDocument( first )!.html,
				ready: true,
			} );
		}
		send( { type: 'config', active: false, generating: false, complete: false } );
	}

	it( 'starts a solo homepage large and centered, then zooms out to keep all its sections visible', () => {
		sizeScene( 1090, 800 );
		addPages( 0 );
		const root = roots[ 0 ].firstElementChild!;
		Object.defineProperty( root, 'offsetHeight', { configurable: true, value: 600 } );
		send( { type: 'config', active: false, generating: false, complete: false } );
		const initial = positions()[ 0 ];
		expect( initial.width ).toBeGreaterThan( 900 );
		expect( initial.x + initial.width / 2 ).toBeCloseTo( 545 );
		Object.defineProperty( root, 'offsetHeight', { configurable: true, value: 3200 } );
		send( { type: 'config', active: false, generating: false, complete: false } );
		const grown = positions()[ 0 ];
		expect( grown.scale ).toBeLessThan( initial.scale );
		expect( grown.x + grown.width / 2 ).toBeCloseTo( 545 );
		expect( grown.y + 3200 * grown.scale ).toBeLessThanOrEqual( 800 );
		expect( document.querySelector< HTMLElement >( '.preview-scene' )!.style.height ).toBe(
			'800px'
		);
	} );

	it.each( [ 720, 1090, 1570 ] )(
		'aligns the finished homepage with the brand gutter and gives companions equal widths at %i',
		( width ) => {
			sizeScene( width, 800 );
			addPages( 3 );
			const [ home, ...companions ] = positions();
			expect( home.x ).toBe( 0 );
			expect( home.width ).toBeGreaterThan( 400 );
			expect( companions[ 0 ].y ).toBe( home.y );
			companions.forEach( ( page ) => {
				expect( page.x - home.x - home.width ).toBeCloseTo( 24 );
				expect( page.width ).toBeCloseTo( companions[ 0 ].width );
				expect( page.x + page.width ).toBeCloseTo( width );
				expect( page.x + page.width ).toBeLessThanOrEqual( width );
			} );
			companions.slice( 1 ).forEach( ( page, index ) => {
				const previous = companions[ index ];
				expect( page.y - ( previous.y + ( 1300 + index * 100 ) * previous.scale ) ).toBeCloseTo(
					40
				);
			} );
			const scene = document.querySelector< HTMLElement >( '.preview-scene' )!;
			expect( parseFloat( scene.style.height ) ).toBeGreaterThanOrEqual(
				home.y + 3200 * home.scale
			);
		}
	);

	it( 'keeps the finished mobile homepage readable with companion pages below', () => {
		sizeScene( 350, 700 );
		addPages( 6 );
		const [ home, ...companions ] = positions();
		expect( home.x + home.width / 2 ).toBeCloseTo( 175 );
		expect( home.width ).toBeCloseTo( 350 );
		companions.forEach( ( page ) => {
			expect( page.y ).toBeGreaterThan( home.y + 3200 * home.scale );
			expect( page.x + page.width ).toBeLessThanOrEqual( 350 );
		} );
		expect(
			parseFloat( document.querySelector< HTMLElement >( '.preview-scene' )!.style.height )
		).toBeGreaterThan( 700 );
	} );
} );

describe( 'homepage-first presentation', () => {
	function page( route: string, revision: number, ready = false, text = first, epoch = '1:1' ) {
		send( {
			type: 'render',
			route,
			revision,
			ready,
			title: route,
			epoch,
			html: preparePreviewDocument( text )!.html,
		} );
	}
	it( 'buffers companion revisions and releases the latest when only homepage readiness changes', () => {
		connect();
		page( '/', 1 );
		page( '/story/', 1 );
		page(
			'/story/',
			2,
			false,
			first.replace( 'Real generated content', 'The latest story content' )
		);
		const companion = document.querySelectorAll< HTMLElement >( '.preview-page' )[ 1 ];
		expect( companion.hidden ).toBe( true );
		expect( roots[ 1 ].textContent ).toContain( 'The latest story content' );
		page( '/', 2, true );
		expect( companion.hidden ).toBe( false );
		expect( document.querySelector< HTMLElement >( '.preview-scene' )!.dataset.presentation ).toBe(
			'showcase'
		);
	} );
	it( 'resets the gate when the homepage starts a new epoch', () => {
		connect();
		page( '/', 1, true );
		page( '/story/', 1 );
		page( '/', 2, false, first, '1:2' );
		expect( document.querySelectorAll< HTMLElement >( '.preview-page' )[ 0 ].hidden ).toBe( true );
		expect( document.querySelector< HTMLElement >( '.preview-scene' )!.dataset.presentation ).toBe(
			'building'
		);
	} );
	it( 'releases buffered pages immediately on host completion, even without a ready preview', () => {
		connect();
		page( '/', 1 );
		page( '/story/', 1 );
		send( { type: 'config', active: false, generating: false, complete: true } );
		expect(
			Array.from( document.querySelectorAll< HTMLElement >( '.preview-page' ) ).every(
				( element ) => ! element.hidden
			)
		).toBe( true );
	} );
} );

describe( 'homepage section presentation', () => {
	let animate: jest.Mock;
	let previousAnimate: PropertyDescriptor | undefined;
	let previousRangeRects: PropertyDescriptor | undefined;

	beforeEach( () => {
		jest.mocked( window.matchMedia ).mock.results[ 0 ].value.matches = false;
		const computedStyle = window.getComputedStyle;
		jest.spyOn( window, 'getComputedStyle' ).mockImplementation( ( element ) => {
			const style = computedStyle( element );
			if ( ! style.opacity ) {
				style.opacity = '1';
			}
			return style;
		} );
		const bounds = {
			x: 0,
			y: 0,
			left: 0,
			top: 0,
			right: 1040,
			bottom: 300,
			width: 1040,
			height: 300,
			toJSON: () => ( {} ),
		};
		jest.spyOn( Element.prototype, 'getBoundingClientRect' ).mockReturnValue( bounds );
		previousRangeRects = Object.getOwnPropertyDescriptor( Range.prototype, 'getClientRects' );
		Object.defineProperty( Range.prototype, 'getClientRects', {
			configurable: true,
			value: () => [ bounds ],
		} );
		previousAnimate = Object.getOwnPropertyDescriptor( Element.prototype, 'animate' );
		animate = jest.fn( () => ( { finished: Promise.resolve(), cancel: jest.fn() } ) );
		Object.defineProperty( Element.prototype, 'animate', { configurable: true, value: animate } );
		const viewport = document.querySelector( '.preview-viewport' )!;
		Object.defineProperty( viewport, 'clientWidth', { configurable: true, value: 1090 } );
		Object.defineProperty( viewport, 'clientHeight', { configurable: true, value: 800 } );
		connect();
	} );

	afterEach( () => {
		for ( const [ prototype, property, descriptor ] of [
			[ Element.prototype, 'animate', previousAnimate ],
			[ Range.prototype, 'getClientRects', previousRangeRects ],
		] as const ) {
			if ( descriptor ) {
				Object.defineProperty( prototype, property, descriptor );
			} else {
				Reflect.deleteProperty( prototype, property );
			}
		}
	} );

	function flights() {
		return animate.mock.contexts.filter( ( node: Element ) =>
			node.classList.contains( 'preview-flight' )
		);
	}

	it( 'features the hero received behind the design card once the preview becomes active', async () => {
		render( 1, first );
		await jest.advanceTimersByTimeAsync( 1500 );
		expect( flights() ).toHaveLength( 0 );
		send( { type: 'config', active: true, generating: true, complete: false } );
		await jest.advanceTimersByTimeAsync( 20 );
		expect( flights() ).toHaveLength( 1 );
		render( 2, first.replace( 'Real generated content', 'Updated generated content' ) );
		await jest.advanceTimersByTimeAsync( 1500 );
		expect( flights() ).toHaveLength( 1 );
	} );

	it( 'waits for the body of an existing section and settles its latest revision before featuring it', async () => {
		const heading =
			'<main class="site"><section id="welcome"><h1>A meaningful first homepage</h1></section></main>';
		render( 1, heading );
		send( { type: 'config', active: true, generating: true, complete: false } );
		await jest.advanceTimersByTimeAsync( 1500 );
		expect( flights() ).toHaveLength( 0 );
		render( 2, first );
		await jest.advanceTimersByTimeAsync( 700 );
		render( 3, first.replace( 'Real generated content', 'The composed section content' ) );
		await jest.advanceTimersByTimeAsync( 700 );
		expect( flights() ).toHaveLength( 0 );
		await jest.advanceTimersByTimeAsync( 600 );
		expect( flights() ).toHaveLength( 1 );
		expect( roots.at( -1 )!.textContent ).toContain( 'The composed section content' );
	} );

	it( 'releases a legitimate heading-only section when the page is ready and skips decorative sections', async () => {
		const heading =
			'<main class="site"><section id="welcome"><h1>A meaningful first homepage with only a heading</h1></section><section id="decoration"></section></main>';
		render( 1, heading );
		send( { type: 'config', active: true, generating: true, complete: false } );
		await jest.advanceTimersByTimeAsync( 1500 );
		expect( flights() ).toHaveLength( 0 );
		send( {
			type: 'render',
			route: '/',
			title: 'Homepage',
			epoch: '1:1',
			revision: 2,
			ready: true,
			html: preparePreviewDocument( heading )!.html,
		} );
		await jest.advanceTimersByTimeAsync( 20 );
		expect( flights() ).toHaveLength( 1 );
	} );

	it( 'shows waiting sections immediately when the host completes', async () => {
		render( 1, first );
		send( { type: 'config', active: true, generating: true, complete: false } );
		expect( roots[ 0 ].querySelector< HTMLElement >( '#welcome' )!.style.visibility ).toBe(
			'hidden'
		);
		send( { type: 'assets', assets: [] } );
		expect( roots[ 0 ].querySelector< HTMLElement >( '#welcome' )!.style.visibility ).toBe(
			'hidden'
		);
		send( { type: 'config', active: true, generating: false, complete: true } );
		await jest.advanceTimersByTimeAsync( 1500 );
		expect( flights() ).toHaveLength( 0 );
		expect( roots[ 0 ].querySelector< HTMLElement >( '#welcome' )!.style.visibility ).toBe( '' );
	} );

	it( 'keeps rendering after the user takes the camera during a section follow', async () => {
		// Stacked at 480 px the story page lands at y = 64; a 100 px viewport keeps
		// it past the follow threshold (55 % of the height), so the camera glides.
		const viewport = document.querySelector< HTMLElement >( '.preview-viewport' )!;
		Object.defineProperty( viewport, 'clientWidth', { configurable: true, value: 480 } );
		Object.defineProperty( viewport, 'clientHeight', { configurable: true, value: 100 } );
		const scene = document.querySelector< HTMLElement >( '.preview-scene' )!;
		Object.defineProperty( scene, 'offsetHeight', { configurable: true, value: 4000 } );
		const hours =
			'<section id="hours"><h2>Opening hours</h2><p>Tuesday to Sunday, seven to three.</p></section>';
		const cakes =
			'<section id="cakes"><h2>Cakes to order</h2><p>Three days ahead, please.</p></section>';
		const story = ( revision: number, extra: string ) =>
			send( {
				type: 'render',
				route: '/story/',
				revision,
				title: 'Story',
				epoch: '1:1',
				html: preparePreviewDocument( first.replace( '</main>', `${ extra }</main>` ) )!.html,
			} );
		send( {
			type: 'render',
			route: '/',
			revision: 1,
			ready: true,
			title: 'Home',
			epoch: '1:1',
			html: preparePreviewDocument( first )!.html,
		} );
		send( { type: 'config', active: true, generating: true, complete: false } );
		story( 1, '' );
		await jest.advanceTimersByTimeAsync( 5000 );
		expect( scene.dataset.presentation ).toBe( 'showcase' );
		story( 2, hours );
		await jest.advanceTimersByTimeAsync( 100 );
		viewport.dispatchEvent( new Event( 'wheel' ) );
		await jest.advanceTimersByTimeAsync( 2000 );
		story( 3, hours + cakes );
		await jest.advanceTimersByTimeAsync( 2000 );
		expect( roots[ 1 ].textContent ).toContain( 'Cakes to order' );
	} );

	async function showcaseWithStory() {
		send( {
			type: 'render',
			route: '/',
			revision: 1,
			ready: true,
			title: 'Home',
			epoch: '1:1',
			html: preparePreviewDocument( first )!.html,
		} );
		send( { type: 'config', active: true, generating: true, complete: false } );
		send( {
			type: 'render',
			route: '/story/',
			revision: 1,
			title: 'Story',
			epoch: '1:1',
			html: preparePreviewDocument( first )!.html,
		} );
		await jest.advanceTimersByTimeAsync( 5000 );
		expect( document.querySelector< HTMLElement >( '.preview-scene' )!.dataset.presentation ).toBe(
			'showcase'
		);
	}

	function tourMessages() {
		return port.postMessage.mock.calls
			.map( ( [ message ] ) => message )
			.filter( ( message ) => message.type === 'tour' );
	}

	it( 'drops the chip highlight when the user scrolls away', async () => {
		await showcaseWithStory();
		const scene = document.querySelector< HTMLElement >( '.preview-scene' )!;
		send( { type: 'focus', route: '/story/' } );
		expect( scene.classList.contains( 'is-touring' ) ).toBe( true );
		expect( tourMessages().pop() ).toMatchObject( { title: 'Story' } );
		document.querySelector( '.preview-viewport' )!.dispatchEvent( new Event( 'wheel' ) );
		expect( scene.classList.contains( 'is-touring' ) ).toBe( false );
		expect( tourMessages().pop() ).toMatchObject( { title: null } );
	} );

	it( 'lets a walk that starts after a chip tap keep its highlight past the chip timer', async () => {
		await showcaseWithStory();
		const scene = document.querySelector< HTMLElement >( '.preview-scene' )!;
		send( { type: 'focus', route: '/story/' } );
		send( { type: 'config', active: true, generating: true, complete: false, finishing: true } );
		await jest.advanceTimersByTimeAsync( 1000 );
		expect( scene.classList.contains( 'is-touring' ) ).toBe( true );
		await jest.advanceTimersByTimeAsync( 12000 );
		expect( scene.classList.contains( 'is-touring' ) ).toBe( true );
		expect( tourMessages().pop().title ).not.toBeNull();
	} );

	it( 'releases buffered companion pages for the walk when the host is finishing without a ready homepage', async () => {
		send( {
			type: 'render',
			route: '/',
			revision: 1,
			title: 'Home',
			epoch: '1:1',
			html: preparePreviewDocument( first )!.html,
		} );
		send( { type: 'config', active: true, generating: true, complete: false } );
		send( {
			type: 'render',
			route: '/story/',
			revision: 1,
			title: 'Story',
			epoch: '1:1',
			html: preparePreviewDocument( first )!.html,
		} );
		await jest.advanceTimersByTimeAsync( 3000 );
		const story = document.querySelectorAll< HTMLElement >( '.preview-page' )[ 1 ];
		expect( story.hidden ).toBe( true );
		send( { type: 'config', active: true, generating: true, complete: false, finishing: true } );
		await jest.advanceTimersByTimeAsync( 6000 );
		expect( story.hidden ).toBe( false );
		expect( document.querySelector< HTMLElement >( '.preview-scene' )!.dataset.presentation ).toBe(
			'showcase'
		);
	} );

	it( 'starts the idle walk even while re-renders that change nothing keep arriving', async () => {
		await showcaseWithStory();
		const scene = document.querySelector< HTMLElement >( '.preview-scene' )!;
		for ( let revision = 2; revision <= 5; revision++ ) {
			await jest.advanceTimersByTimeAsync( 2000 );
			send( {
				type: 'render',
				route: '/story/',
				revision,
				title: 'Story',
				epoch: '1:1',
				html: preparePreviewDocument( first )!.html,
			} );
		}
		await jest.advanceTimersByTimeAsync( 1000 );
		expect( scene.classList.contains( 'is-touring' ) ).toBe( true );
		expect( tourMessages().pop().title ).not.toBeNull();
	} );
} );
