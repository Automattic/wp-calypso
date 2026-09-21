import {
	buildSvg,
	clearFontCache,
	collectStyleText,
	editOutgrowsViewport,
	getBands,
	getCaptureRect,
	getInkSpans,
	getUsedFontFamilies,
	inlineFonts,
	offsetCloneToBand,
	pinViewportPositionedElements,
	rasterizeCanvas,
	replaceImagesWithPlaceholders,
	whenStill,
} from '../rasterizer';

const asDocument = ( value: unknown ) => value as Document;
const asWindow = ( value: unknown ) => value as Window;

// jsdom has neither `fetch` nor `AbortSignal.timeout`. The deadline is stubbed
// to a value the assertions can recognise; its real absence is covered
// explicitly, since getting the optional call wrong would refuse captures
// wholesale rather than fail visibly.
const abortSignal = AbortSignal as unknown as { timeout?: ( milliseconds: number ) => unknown };
const globals = globalThis as { fetch?: unknown };
const fetchMock = () => globals.fetch as jest.Mock;

function stubFetch( implementation: ( ...args: unknown[] ) => unknown = () => undefined ) {
	globals.fetch = jest.fn( implementation );
}

function stubFont() {
	stubFetch( async () => ( {
		ok: true,
		headers: { get: () => 'font/woff2' },
		arrayBuffer: async () => new Uint8Array( [ 1, 2, 3 ] ).buffer,
	} ) );
}

beforeEach( () => {
	abortSignal.timeout = jest.fn( ( milliseconds ) => `deadline:${ milliseconds }` );
} );

afterEach( () => {
	delete abortSignal.timeout;
	delete globals.fetch;
	clearFontCache();
} );

const box = ( {
	left,
	top,
	width,
	height,
}: Record< 'left' | 'top' | 'width' | 'height', number > ) => ( {
	left,
	top,
	width,
	height,
	right: left + width,
	bottom: top + height,
} );

type Boxes = Record< string, ReturnType< typeof box > >;

// A canvas whose blocks sit at the given boxes; anything else is missing.
const canvasWith = ( boxesByClientId: Boxes ) => ( {
	querySelector: jest.fn( ( selector: string ) => {
		const rect = boxesByClientId[ selector.match( /"(.*)"/ )?.[ 1 ] ?? '' ];

		return rect ? { getBoundingClientRect: () => rect } : null;
	} ),
} );

describe( 'getCaptureRect', () => {
	const setup = ( boxesByClientId: Boxes, { scrollY = 0, documentHeight = 5581 } = {} ) => ( {
		canvasDocument: asDocument( {
			...canvasWith( boxesByClientId ),
			documentElement: { scrollWidth: 981, scrollHeight: documentHeight },
			body: { scrollWidth: 981, scrollHeight: documentHeight },
		} ),
		canvasWindow: asWindow( { scrollX: 0, scrollY, innerWidth: 981, innerHeight: 1000 } ),
	} );

	it( 'frames the viewport at the current scroll when given no blocks', () => {
		const { canvasDocument, canvasWindow } = setup( {}, { scrollY: 2058 } );

		expect( getCaptureRect( canvasDocument, canvasWindow, [] ) ).toEqual( {
			x: 0,
			y: 2058,
			width: 981,
			height: 1000,
			framed: 0,
		} );
	} );

	it( 'centres a viewport-sized band on the blocks, rather than cropping to them', () => {
		const { canvasDocument, canvasWindow } = setup(
			{ a: box( { left: 49, top: 300, width: 304, height: 390 } ) },
			{ scrollY: 2746 }
		);

		// Cropping tightly gave images too small to judge spacing or alignment
		// against neighbours, which is most of what a picture is wanted for.
		// The block spans document y 3046-3436, centre 3241, less half a
		// 1000px viewport.
		expect( getCaptureRect( canvasDocument, canvasWindow, [ 'a' ] ) ).toEqual( {
			x: 0,
			y: 2741,
			width: 981,
			height: 1000,
			framed: 1,
		} );
	} );

	it.each( [
		// The agent routinely edits something off screen. A band at the scroll
		// position would show an unrelated part of the page, which reads as the
		// edit never having happened.
		[ 'looks where the block is, not where the user is scrolled', -2000, 100, 2500, 50 ],
		[ 'never runs off the top of the document', 10, 40, 0, 0 ],
		[ 'never runs off the bottom of the document', 5500, 40, 0, 4581 ],
		// Centring on a zero-sized box would frame an arbitrary part of the page.
		[ 'ignores a block that has no layout', 0, 0, 900, 900 ],
	] )( '%s', ( _name, top, height, scrollY, expectedY ) => {
		const { canvasDocument, canvasWindow } = setup(
			{ a: box( { left: 0, top, width: height && 300, height } ) },
			{ scrollY }
		);

		expect( getCaptureRect( canvasDocument, canvasWindow, [ 'a' ] ).y ).toBe( expectedY );
	} );
} );

describe( 'editOutgrowsViewport', () => {
	const canvasWindow = asWindow( { scrollY: 0, innerWidth: 981, innerHeight: 1000 } );

	it( 'is true when the edited blocks reach past a screenful', () => {
		// Recolouring every heading leaves blocks from top to bottom. One band
		// centred on their midpoint frames the middle of the document and leaves
		// the other forty changes unseen.
		const canvasDocument = asDocument(
			canvasWith( {
				first: box( { left: 0, top: 100, width: 900, height: 50 } ),
				last: box( { left: 0, top: 4000, width: 900, height: 50 } ),
			} )
		);

		expect( editOutgrowsViewport( canvasDocument, canvasWindow, [ 'first', 'last' ] ) ).toBe(
			true
		);
	} );

	it.each( [
		[ 'an edit that fits in one', [ 'only' ] ],
		[ 'a block that did not resolve', [ 'gone' ] ],
		[ 'no blocks', [] ],
	] )( 'is false for %s', ( _name, clientIds ) => {
		const canvasDocument = asDocument(
			canvasWith( { only: box( { left: 0, top: 300, width: 900, height: 200 } ) } )
		);

		expect( editOutgrowsViewport( canvasDocument, canvasWindow, clientIds ) ).toBe( false );
	} );
} );

describe( 'replaceImagesWithPlaceholders', () => {
	const setup = ( html: string, { backgroundImage = 'none' } = {} ) => {
		const live = document.createElement( 'div' );
		live.innerHTML = html;

		// jsdom lays nothing out, so rendered boxes are supplied here.
		live.querySelectorAll( 'img' ).forEach( ( image ) => {
			image.getBoundingClientRect = () =>
				box( { left: 0, top: 0, width: 640, height: 480 } ) as DOMRect;
		} );

		const view = asWindow( { getComputedStyle: () => ( { backgroundImage } ) } );

		return { live, clone: live.cloneNode( true ) as HTMLElement, view };
	};

	it( 'swaps an image for a box of its rendered size that fetches nothing', () => {
		const { live, clone, view } = setup(
			'<img src="https://example.com/hero.jpg" srcset="hero-2x.jpg 2x" sizes="100vw" />'
		);

		replaceImagesWithPlaceholders( live, clone, view );

		// Without content an <img> collapses to its intrinsic size, which would
		// shift everything laid out around it.
		const image = clone.querySelector( 'img' ) as HTMLImageElement;

		expect( image.getAttribute( 'src' ) ).toMatch( /^data:image\/gif/ );
		expect( image.hasAttribute( 'srcset' ) ).toBe( false );
		expect( image.hasAttribute( 'sizes' ) ).toBe( false );
		expect( image.style.width ).toBe( '640px' );
		expect( image.style.height ).toBe( '480px' );
		expect( image.style.backgroundColor ).toBeTruthy();
	} );

	it( 'replaces a CSS background image, where cover blocks keep theirs', () => {
		const { live, clone, view } = setup( '<div class="cover"></div>', {
			backgroundImage: 'url("https://example.com/cover.jpg")',
		} );

		replaceImagesWithPlaceholders( live, clone, view );

		const cover = clone.querySelector( '.cover' ) as HTMLElement;

		expect( cover.style.backgroundImage ).toBe( 'none' );
		expect( cover.style.backgroundColor ).toBeTruthy();
	} );

	it( 'leaves a gradient background in place, which is colour rather than a photograph', () => {
		const { live, clone, view } = setup( '<div class="band"></div>', {
			backgroundImage: 'linear-gradient(180deg, #000, #fff)',
		} );

		replaceImagesWithPlaceholders( live, clone, view );

		expect( ( clone.querySelector( '.band' ) as HTMLElement ).style.backgroundImage ).toBe( '' );
	} );

	it( 'leaves an element without a background image alone', () => {
		const { live, clone, view } = setup( '<div class="plain"></div>' );

		replaceImagesWithPlaceholders( live, clone, view );

		expect( ( clone.querySelector( '.plain' ) as HTMLElement ).style.backgroundColor ).toBe( '' );
	} );
} );

describe( 'collectStyleText', () => {
	const BASE_URI = 'https://example.com/wp-admin/site-editor.php';
	const readable = ( ...rules: string[] ) => ( {
		cssRules: rules.map( ( cssText ) => ( { cssText } ) ),
	} );

	// A sheet the browser refuses to expose through `cssRules`. The `<link>`
	// having been written without `crossorigin="anonymous"` is enough, whatever
	// the server's CORS headers say.
	const opaque = ( href: string ) => ( {
		href,
		get cssRules(): CSSRuleList {
			throw new Error( 'SecurityError' );
		},
	} );

	const documentWith = ( styleSheets: unknown[], baseURI = BASE_URI ) =>
		asDocument( { baseURI, styleSheets } );

	it( 'concatenates the rules of every sheet', async () => {
		const canvasDocument = documentWith( [
			readable( 'a{color:red}' ),
			readable( 'b{color:blue}' ),
		] );

		await expect( collectStyleText( canvasDocument ) ).resolves.toEqual( {
			text: 'a{color:red}\nb{color:blue}',
			refetched: 0,
			skipped: 0,
		} );
	} );

	it( 'refetches a sheet the browser will not expose, within a deadline', async () => {
		// s0.wp.com serves `ACAO: *`, so a cors-mode fetch reads what `cssRules`
		// refuses. Nothing about the CSS was ever unreachable.
		stubFetch( async () => ( { ok: true, text: async () => '.form{margin:0}' } ) );
		const canvasDocument = documentWith( [
			readable( 'a{color:red}' ),
			opaque( 'https://s0.wp.com/jetpack-forms-layout.css' ),
		] );

		await expect( collectStyleText( canvasDocument ) ).resolves.toEqual( {
			text: 'a{color:red}\n.form{margin:0}',
			refetched: 1,
			skipped: 0,
		} );
		expect( fetchMock() ).toHaveBeenCalledWith( 'https://s0.wp.com/jetpack-forms-layout.css', {
			signal: 'deadline:3000',
		} );
	} );

	it( 'still fetches where the browser has no AbortSignal.timeout', async () => {
		// Called unguarded, this would throw inside the catch and make every
		// sheet look unreadable — refusing captures on browsers that merely lack
		// a deadline.
		delete abortSignal.timeout;
		stubFetch( async () => ( { ok: true, text: async () => '.form{margin:0}' } ) );
		const canvasDocument = documentWith( [ opaque( 'https://s0.wp.com/forms.css' ) ] );

		await expect( collectStyleText( canvasDocument ) ).resolves.toMatchObject( {
			text: '.form{margin:0}',
			refetched: 1,
		} );
		expect( fetchMock() ).toHaveBeenCalledWith( 'https://s0.wp.com/forms.css', {
			signal: undefined,
		} );
	} );

	it.each( [
		[ 'is refused', async () => ( { ok: false, status: 403 } ) ],
		// A stalled connection never rejects on its own, which is the whole
		// reason for the deadline: without it the tool result waits behind it.
		[
			'gives up on the deadline',
			async () => {
				throw new DOMException( 'The operation timed out', 'TimeoutError' );
			},
		],
	] )( 'drops a sheet whose refetch %s and keeps the rest', async ( _name, fetch ) => {
		// One plugin stylesheet missing leaves the page substantially itself.
		// Refusing would mean this page could never be captured at all.
		stubFetch( fetch );
		const canvasDocument = documentWith( [
			readable( 'a{color:red}' ),
			opaque( 'https://cdn.example.com/theme.css' ),
		] );

		await expect( collectStyleText( canvasDocument ) ).resolves.toEqual( {
			text: 'a{color:red}\n',
			refetched: 0,
			skipped: 1,
		} );
	} );

	it( 'fails the capture when no sheet can be read', async () => {
		// An unstyled render is not a degraded picture of the page; it is a
		// convincing picture of a different one.
		stubFetch( async () => ( { ok: false, status: 403 } ) );
		const canvasDocument = documentWith( [ opaque( 'https://cdn.example.com/theme.css' ) ] );

		await expect( collectStyleText( canvasDocument ) ).rejects.toMatchObject( {
			reason: 'stylesheet',
		} );
	} );

	it.each( [
		// Resolved against wp-admin instead, this would 404 — and because fonts
		// fail closed, every capture on the theme would return nothing.
		[
			'a linked sheet against the sheet',
			{
				href: 'https://example.com/wp-content/themes/x/style.css',
				...readable( '@font-face{src:url(fonts/inter.woff2)}' ),
			},
			'https://example.com/wp-content/themes/x/fonts/inter.woff2',
		],
		[
			'an inline sheet against the document',
			readable( '@font-face{src:url(fonts/inter.woff2)}' ),
			'https://example.com/wp-admin/fonts/inter.woff2',
		],
		[
			'a refetched sheet against the sheet',
			opaque( 'https://cdn.example.com/theme/style.css' ),
			'https://cdn.example.com/theme/fonts/inter.woff2',
		],
	] )( 'resolves a relative url in %s', async ( _name, sheet, expectedUrl ) => {
		stubFetch( async () => ( {
			ok: true,
			text: async () => '@font-face{src:url(fonts/inter.woff2)}',
		} ) );

		const { text } = await collectStyleText( documentWith( [ sheet ] ) );

		expect( text ).toContain( expectedUrl );
	} );

	it( 'leaves data uris alone', async () => {
		const canvasDocument = documentWith( [
			readable( '@font-face{src:url(data:font/woff2;base64,AA)}' ),
		] );

		const { text } = await collectStyleText( canvasDocument );

		expect( text ).toContain( 'url(data:font/woff2;base64,AA)' );
	} );
} );

describe( 'inlineFonts', () => {
	it( 'leaves CSS without font urls untouched', async () => {
		await expect( inlineFonts( 'a{color:red}' ) ).resolves.toBe( 'a{color:red}' );
	} );

	it( 'rewrites font urls as data uris, and only those', async () => {
		// A wpcom editor canvas carries hundreds of image urls across ~12,000
		// rules. Fetching them would inline the very images the rasterizer
		// skips, and one 404 among them would refuse the whole capture.
		stubFont();

		const css = await inlineFonts(
			'.icon{background:url("https://example.com/sprite.png")}' +
				'@font-face{src:url("https://example.com/inter.woff2")}'
		);

		expect( fetchMock() ).toHaveBeenCalledTimes( 1 );
		expect( css ).toContain( 'https://example.com/sprite.png' );
		expect( css ).toContain( 'data:font/woff2;base64,' );
		expect( css ).not.toContain( 'https://example.com/inter.woff2' );
	} );

	it( 'drops font faces the page never used, and gives a font a longer deadline', async () => {
		// A wpcom editor registers the whole font library. Inlining every face
		// produced 123 MB of base64 — the dominant cost of a capture, and large
		// enough that rules after it never got applied.
		stubFont();

		const css = await inlineFonts(
			'@font-face{font-family:"Used";src:url("https://example.com/a.woff2")}' +
				'@font-face{font-family:"Unused";src:url("https://example.com/b.woff2")}',
			new Set( [ 'used' ] )
		);

		expect( css ).not.toContain( 'Unused' );
		expect( css ).not.toContain( 'b.woff2' );
		expect( fetchMock() ).toHaveBeenCalledTimes( 1 );
		// Longer than a stylesheet's, because a font that gives up refuses the
		// whole capture rather than degrading it.
		expect( fetchMock() ).toHaveBeenCalledWith( 'https://example.com/a.woff2', {
			signal: 'deadline:8000',
		} );
	} );

	it( 'keeps every face when no used set is given', async () => {
		stubFont();

		const css = await inlineFonts(
			'@font-face{font-family:"A";src:url("https://example.com/a.woff2")}'
		);

		expect( css ).toContain( 'data:font/woff2;base64,' );
	} );

	it( 'fetches a url once per capture, and once across captures', async () => {
		// A font at a URL does not change, so the cache needs no invalidation —
		// and measured, it is where the time went: ten times the cost of
		// reading every CSS rule on the page.
		stubFont();
		const css =
			'@font-face{font-family:"A";src:url("https://x/a.woff2")}' +
			'@font-face{font-family:"A";font-weight:700;src:url("https://x/a.woff2")}';

		await inlineFonts( css, new Set( [ 'a' ] ) );
		await inlineFonts( css, new Set( [ 'a' ] ) );

		expect( fetchMock() ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'skips urls that are already inlined', async () => {
		stubFetch();

		await inlineFonts( '@font-face{src:url("data:font/woff2;base64,AAA")}' );

		expect( fetchMock() ).not.toHaveBeenCalled();
	} );

	it( 'fails the capture when a font cannot be fetched, without caching the failure', async () => {
		// A substituted font breaks lines in different places, so the capture
		// would misreport the wrapping it exists to show.
		stubFetch( async () => ( { ok: false, status: 503 } ) );
		const css = '@font-face{font-family:"B";src:url("https://x/flaky.woff2")}';

		await expect( inlineFonts( css, new Set( [ 'b' ] ) ) ).rejects.toMatchObject( {
			reason: 'font',
		} );

		// Cached, one bad response would refuse every capture for the rest of
		// the session.
		stubFont();
		await expect( inlineFonts( css, new Set( [ 'b' ] ) ) ).resolves.toContain(
			'data:font/woff2;base64,'
		);
	} );
} );

describe( 'getUsedFontFamilies', () => {
	it( 'keeps only families the page has asked for', () => {
		const fonts = [
			{ family: '"Inter"', status: 'loaded' },
			{ family: 'Cardo', status: 'loading' },
			{ family: 'Never Used', status: 'unloaded' },
		];
		const canvasDocument = asDocument( {
			fonts: { forEach: ( callback: ( font: unknown ) => void ) => fonts.forEach( callback ) },
		} );

		expect( getUsedFontFamilies( canvasDocument ) ).toEqual( new Set( [ 'inter', 'cardo' ] ) );
	} );

	it( 'survives a document with no font set', () => {
		expect( getUsedFontFamilies( asDocument( {} ) ) ).toEqual( new Set() );
	} );
} );

describe( 'getBands', () => {
	it.each( [
		// A whole page cannot be rendered in one SVG — 981x5581 comes back
		// blank — so a full-page capture is many screenful renders stitched,
		// the last one short rather than overhanging the foot of the page.
		[
			'covers the page without overhanging the foot of it',
			2500,
			1000,
			[
				{ y: 0, height: 1000 },
				{ y: 1000, height: 1000 },
				{ y: 2000, height: 500 },
			],
		],
		[ 'is one band for a page shorter than the viewport', 600, 1000, [ { y: 0, height: 600 } ] ],
		[ 'refuses to loop forever on a zero height', 2500, 0, [] ],
	] )( '%s', ( _name, documentHeight, bandHeight, expected ) => {
		expect( getBands( documentHeight, bandHeight ) ).toEqual( expected );
	} );
} );

describe( 'getInkSpans', () => {
	const setup = (
		html: string,
		boxes: { top: number; height: number }[],
		{ scrollY = 0, backgroundImage = 'none' } = {}
	) => {
		const body = document.createElement( 'div' );
		body.innerHTML = html;
		body.querySelectorAll( '*' ).forEach( ( element, index ) => {
			const rect = boxes[ index ] || { top: 0, height: 0 };
			element.getBoundingClientRect = () =>
				box( { left: 0, top: rect.top, width: 100, height: rect.height } ) as DOMRect;
		} );

		return {
			body,
			view: asWindow( { scrollY, getComputedStyle: () => ( { backgroundImage } ) } ),
		};
	};

	it.each( [
		[ 'an element holding its own text', '<p>Reserve Today</p>', [ { top: 100, height: 40 } ] ],
		[
			'an image, which paints as a placeholder box',
			'<img src="x.jpg" />',
			[ { top: 100, height: 40 } ],
		],
	] )( 'reports a span for %s', ( _name, html, boxes ) => {
		const { body, view } = setup( html, boxes );

		expect( getInkSpans( body, view ) ).toEqual( [ { top: 100, bottom: 140 } ] );
	} );

	it( 'ignores wrappers that hold no text of their own', () => {
		// Otherwise every section wrapper claims ink and a genuinely empty band
		// gets retried to no purpose.
		const { body, view } = setup( '<div><span></span></div>', [ { top: 0, height: 500 } ] );

		expect( getInkSpans( body, view ) ).toEqual( [] );
	} );

	it( 'counts an element whose image is a CSS background', () => {
		const { body, view } = setup( '<div class="cover"></div>', [ { top: 0, height: 500 } ], {
			backgroundImage: 'url(photo.jpg)',
		} );

		expect( getInkSpans( body, view ) ).toEqual( [ { top: 0, bottom: 500 } ] );
	} );

	it( 'reports spans in document coordinates', () => {
		const { body, view } = setup( '<p>Footer</p>', [ { top: 50, height: 100 } ], {
			scrollY: 4000,
		} );

		expect( getInkSpans( body, view ) ).toEqual( [ { top: 4050, bottom: 4150 } ] );
	} );
} );

describe( 'pinViewportPositionedElements', () => {
	const setup = ( html: string, position: string, { scrollY = 0 } = {} ) => {
		const live = document.createElement( 'div' );
		live.innerHTML = html;
		live.querySelectorAll( '*' ).forEach( ( element ) => {
			element.getBoundingClientRect = () =>
				box( { left: 0, top: 40, width: 981, height: 90 } ) as DOMRect;
		} );

		return {
			live,
			clone: live.cloneNode( true ) as HTMLElement,
			view: asWindow( { scrollX: 0, scrollY, getComputedStyle: () => ( { position } ) } ),
		};
	};

	it.each( [ 'fixed', 'sticky' ] )(
		'repins a %s element to where it currently sits',
		( position ) => {
			// Left pinned to the viewport, it paints again in every band — six
			// copies of the header marching down the stitched page.
			const { live, clone, view } = setup( '<header class="site-header"></header>', position, {
				scrollY: 2000,
			} );

			pinViewportPositionedElements( live, clone, view );

			const header = clone.querySelector( '.site-header' ) as HTMLElement;

			expect( header.style.position ).toBe( 'absolute' );
			expect( header.style.top ).toBe( '2040px' );
		}
	);

	it( 'leaves ordinary elements in flow', () => {
		const { live, clone, view } = setup( '<p class="body"></p>', 'static' );

		pinViewportPositionedElements( live, clone, view );

		expect( ( clone.querySelector( '.body' ) as HTMLElement ).style.position ).toBe( '' );
	} );
} );

describe( 'offsetCloneToBand', () => {
	it( 'slides the page up and keeps it at the document width', () => {
		// The frame sits at the origin and cannot be moved, so the band has to
		// be brought to it. Relative positioning shifts without reflowing, and
		// laid out at the frame's width instead the whole page would reflow.
		const clone = document.createElement( 'body' );

		offsetCloneToBand( clone, 2398, 981 );

		expect( clone.style.top ).toBe( '-2398px' );
		expect( clone.style.position ).toBe( 'relative' );
		expect( clone.style.width ).toBe( '981px' );
	} );
} );

describe( 'buildSvg', () => {
	const frame = { width: 10, height: 10 };

	it( 'frames a band at the document width, never the whole page', () => {
		// A full-page SVG does not rasterize at all — 981x5581 came back
		// entirely blank — and a translated viewBox shows a region Chrome never
		// painted. So the frame stays small, and the page is offset behind it.
		const svg = buildSvg( '<p>hi</p>', 'p{margin:0}', { width: 1104, height: 300 } );

		expect( svg ).toContain( 'width="1104" height="300"' );
		expect( svg ).not.toContain( 'viewBox' );
		expect( svg ).toContain( '<foreignObject x="0" y="0" width="1104" height="300">' );
		expect( svg ).toContain( '<p>hi</p>' );
	} );

	it( 'wraps the CSS in CDATA so XML parsing survives it', () => {
		// The SVG is parsed as XML. One `&` or `<` among 12,000 rules would
		// otherwise fail the parse, and the image would never decode.
		const svg = buildSvg( '<p>hi</p>', 'a[href*="?a=1&b=2"]{color:red}', frame );

		expect( svg ).toContain( '<![CDATA[a[href*="?a=1&b=2"]{color:red}' );
		expect( svg ).toContain( ']]></style>' );
	} );

	it( 'appends the render overrides after the page CSS', () => {
		// A foreignObject has no viewport, so `content-visibility: auto` skips
		// every subtree; and an SVG image freezes its own timeline at zero, so
		// an entrance animation renders at its first frame — build mode's
		// sections rest at `opacity: 0` — however long ago it finished on screen.
		const svg = buildSvg( '<p>hi</p>', 'p{margin:0}', frame );

		expect( svg ).toContain( 'content-visibility:visible!important' );
		expect( svg ).toContain( 'contain:none!important' );
		expect( svg ).toContain( 'animation-delay:-1s!important' );
		expect( svg ).toContain( 'animation-duration:1ms!important' );
		expect( svg ).toContain( 'animation-fill-mode:both!important' );
		expect( svg ).toContain( 'transition:none!important' );
		expect( svg.indexOf( 'p{margin:0}' ) ).toBeLessThan( svg.indexOf( 'content-visibility' ) );
	} );

	it( 'keeps the body a sibling of the style, not nested in a wrapper', () => {
		// Nested inside a <div>, the clone is no longer the document body and
		// every rule written against `body` stops applying to it.
		const svg = buildSvg( '<body class="x"></body>', 'p{margin:0}', frame );

		expect( svg ).not.toContain( '<div' );
		expect( svg ).toContain( '</style><body class="x">' );
	} );
} );

describe( 'whenStill', () => {
	// A canvas whose blocks move for a while and then stop, driven a frame at a
	// time — the shape of the editor's own spring-driven reorder.
	const setup = ( { positions = [ 0 ], scrollPositions = [ 0 ] } = {} ) => {
		const tops = [ ...positions ];
		const scrolls = [ ...scrollPositions ];
		let top = tops.shift();

		const canvasWindow = {
			scrollX: 0,
			scrollY: scrolls.shift(),
			requestAnimationFrame: ( callback: () => void ) =>
				setTimeout( () => {
					if ( tops.length ) {
						top = tops.shift();
					}

					if ( scrolls.length ) {
						canvasWindow.scrollY = scrolls.shift();
					}
					callback();
				}, 0 ),
		};

		const block = { getBoundingClientRect: () => ( { top, left: 0, width: 300, height: 200 } ) };
		const canvasDocument = {
			querySelector: jest.fn( () => block ),
			querySelectorAll: jest.fn( () => [ block ] ),
		};

		return {
			canvasDocument: asDocument( canvasDocument ),
			canvasWindow: asWindow( canvasWindow ),
			querySelectorAll: canvasDocument.querySelectorAll,
			blockTop: () => top,
			scrollY: () => canvasWindow.scrollY,
		};
	};

	it( 'waits for a block that is still travelling to its new slot', async () => {
		// The editor's reorder animation is a react-spring controller writing
		// `transform` inline from a rAF loop. Nothing reports it as an
		// animation, so the only way to know it is running is to watch where
		// the block is.
		const { canvasDocument, canvasWindow, blockTop } = setup( {
			positions: [ 0, 40, 80, 120, 120, 120 ],
		} );

		await whenStill( canvasDocument, canvasWindow, [ 'abc' ] );

		expect( blockTop() ).toBe( 120 );
	} );

	it( 'does not mistake the stillness before the motion for the end of it', async () => {
		// The move animation is set up in a layout effect, so the page can be
		// perfectly still for a frame after the edit returns and start moving
		// straight afterwards. Two matching measurements are not enough.
		const { canvasDocument, canvasWindow, blockTop } = setup( {
			positions: [ 0, 0, 0, 60, 120, 120, 120 ],
		} );

		await whenStill( canvasDocument, canvasWindow, [ 'abc' ] );

		expect( blockTop() ).toBe( 120 );
	} );

	// A background tab fires no frames; the capture must still answer.
	it( 'does not wait forever on a window whose frames never come', async () => {
		const { canvasDocument, canvasWindow } = setup();
		( canvasWindow as { requestAnimationFrame: unknown } ).requestAnimationFrame = () => 0;

		await expect( whenStill( canvasDocument, canvasWindow, [ 'abc' ] ) ).resolves.toBeUndefined();
	} );

	it( 'gives up rather than waiting on motion that never ends', async () => {
		const { canvasDocument, canvasWindow } = setup( {
			positions: Array.from( { length: 200 }, ( _, index ) => index * 10 ),
		} );

		await expect(
			whenStill( canvasDocument, canvasWindow, [ 'abc' ], 60 )
		).resolves.toBeUndefined();
	} );

	it( 'waits for a smooth scroll to come to rest', async () => {
		// Scrolling is not an animation the document reports either, and a
		// capture with no blocks to frame is positioned at the current scroll.
		const { canvasDocument, canvasWindow, scrollY } = setup( {
			scrollPositions: [ 0, 200, 400, 400, 400, 400 ],
		} );

		await whenStill( canvasDocument, canvasWindow, [] );

		expect( scrollY() ).toBe( 400 );
	} );

	it( 'measures blocks the capture was not framed on, and settles on a page that never moves', async () => {
		// A reorder animates the block that gave up the slot as well as the one
		// that took it, and the edit names only one of them.
		const { canvasDocument, canvasWindow, querySelectorAll } = setup();

		await expect( whenStill( canvasDocument, canvasWindow, [] ) ).resolves.toBeUndefined();

		expect( querySelectorAll ).toHaveBeenCalledWith( '[data-block]' );
	} );
} );

describe( 'rasterizeCanvas', () => {
	it( 'is null for a canvas with no body', async () => {
		const context = {
			canvasDocument: asDocument( { body: null } ),
			canvasWindow: asWindow( {} ),
			clientIds: [],
			fullPage: false,
		};

		await expect( rasterizeCanvas( context ) ).resolves.toBeNull();
	} );
} );
