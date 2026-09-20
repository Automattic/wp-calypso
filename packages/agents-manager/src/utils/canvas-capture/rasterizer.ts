/**
 * Renders the editor canvas to an image, in the browser.
 *
 * The canvas subtree is serialized into an SVG `<foreignObject>` and drawn to a
 * `<canvas>`. The embedded markup is laid out by the browser's own engine, so
 * line breaks, spacing, and overflow match what the user sees — which is the
 * point, since those are the things the block tree cannot report.
 *
 * Two deliberate departures from a faithful copy:
 *
 * Images become flat placeholder boxes. Inlining them is the dominant cost of a
 * capture, and drawing cross-origin pixels taints the canvas, which makes
 * `toBlob` throw outright. Whether the right image landed is also the one thing
 * the block tree already answers, through the `url` attribute. The placeholder
 * keeps the element's rendered box so the layout around it is unchanged.
 *
 * Fonts are inlined, and a font that cannot be inlined fails the whole capture.
 * Line breaking is a function of font metrics: substitute the font and the
 * capture reports different wrapping than the page has. An image that quietly
 * lies about layout is worse than no image, so this fails closed.
 */

import type { CanvasCaptureContext, CanvasRasterizer, FilePart } from './capture';

// Bounds the encoded size and the model's per-image token cost, which scale with
// output pixels rather than with page complexity.
const MAX_LONG_EDGE = 1400;

const PLACEHOLDER_FILL = '#d5d7da';
const IMAGE_MIME = 'image/webp';
const IMAGE_QUALITY = 0.92;

// A full page is read for colour, across text only a few pixels tall after the
// page is scaled to fit. Lossy encoding subsamples chroma — halving colour
// resolution in both axes — which destroys precisely that signal: telling teal
// from navy from dark purple is the first thing to go. PNG is lossless, and
// still compresses well here because photographs are flat placeholder boxes.
const FULL_PAGE_MIME = 'image/png';

// How long to let the embedded document settle before each draw attempt.
//
// Rasterizing a `foreignObject` needs the main thread, and the moment a capture
// most often happens — straight after an apply — is the moment the editor is
// busiest re-rendering the blocks that just changed. A capture taken while the
// editor is idle lands on the first attempt; one taken under that contention
// needs considerably longer, so the budget runs to ~2s before giving up. It is
// only ever paid when a draw comes back blank.
const RENDER_SETTLE_STEPS = [ 16, 64, 160, 320, 640, 1000 ];

// Longest to wait for the canvas to stop moving before capturing it anyway.
//
// Covers the editor's own entrance animations, the longest of which — build
// mode's `slidein` — runs for a second. Past that the motion is either
// indefinite or something is wrong, and a picture of a page still in flight is
// worth more than no picture at all.
const MOTION_SETTLE_TIMEOUT = 1200;

// Longest to wait on a stylesheet the browser would not expose, and on a font.
//
// Every other way a capture can be slow is already bounded — motion settling,
// idle waits, the render retry ladder — each on the same reasoning: an
// unbounded wait is worse than a missing image. The two network fetches were
// the exception, and they are the likeliest to hang, since a stalled connection
// never rejects and so never reaches the `catch` that handles a failure.
//
// The budgets differ because the consequences do. A stylesheet that times out is
// dropped and the capture goes on without it, so the wait can be short. A font
// that times out refuses the whole capture, and a large face on a cold CDN over
// a slow connection legitimately takes seconds — too tight a value here would
// turn captures that work today into refusals. It is paid once per session, the
// font cache serving every capture after the first, so patience is cheap.
const STYLESHEET_FETCH_TIMEOUT = 3000;
const FONT_FETCH_TIMEOUT = 8000;

// How many blocks to measure when deciding whether the page has stopped moving.
// A reorder animates the block that gave up the slot as well as the one that
// took it, and neither is necessarily the block that was edited, so the sample
// is spread across the page rather than taken at the edit.
const MOTION_SAMPLE_LIMIT = 16;

// Consecutive identical measurements before the page counts as still.
const MOTION_STABLE_SAMPLES = 2;

// Frames to watch before believing the first pair of them.
//
// The capture is asked for the moment the edit returns, and the editor's move
// animation starts in a layout effect after React has re-rendered — which may
// be a frame or two later. Measuring twice and leaving immediately would sample
// the page in the stillness *before* the motion, and capture into the middle of
// it.
const MOTION_MINIMUM_FRAMES = 3;

// Above this many distinct sampled colours, something more than flat container
// backgrounds has painted. Text alone clears it easily thanks to antialiasing.
const DISTINCT_COLOURS_RENDERED = 8;

// A 1x1 transparent GIF. Assigned to placeholder images so nothing is fetched
// and no cross-origin pixels can taint the canvas.
const BLANK_PIXEL =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Overrides appended after the page's own CSS.
 *
 * Rendering containment is a viewport optimisation, and a `<foreignObject>` has
 * no viewport: `content-visibility: auto` decides nothing is on screen and skips
 * every subtree, so containers paint their own background while their contents
 * render as nothing. `contain` can suppress painting the same way. Forcing both
 * off reproduces what the user sees on screen, which is the only state worth
 * capturing.
 *
 * Animations are wound past their end. An SVG image has its own timeline, frozen
 * at zero, so every animation in the clone renders at its *first* frame no
 * matter how long ago it finished on screen — and an entrance animation's first
 * frame is by construction the state the page is not in. Build mode is the plain
 * case: sections carry `opacity: 0; transform: translate3d(0,75px,0)` as their
 * resting style and are brought in by a filled `slidein`, so a clone of a page
 * the user is looking at renders every one of them invisible. A long negative
 * delay against a near-zero duration samples each animation after it has ended,
 * and `both` makes that last frame fill, which is where the finished animation
 * left the page. Transitions go for the same reason: nothing changes state
 * inside the clone, so a transition can only interpolate away from the value the
 * page has settled on.
 */
const RENDER_OVERRIDES =
	'*{content-visibility:visible!important;contain:none!important;}' +
	'*,*::before,*::after{animation-delay:-1s!important;animation-duration:1ms!important;' +
	'animation-iteration-count:1!important;animation-fill-mode:both!important;' +
	'transition:none!important;}';

interface CaptureRect {
	x: number;
	y: number;
	width: number;
	height: number;
	/** How many of the named blocks the band was framed on. */
	framed: number;
}

/**
 * Why a capture could not be made faithful.
 *
 * A small closed set on purpose: the message carries stylesheet hrefs and font
 * URLs, which help when the error is inspected by hand and are unusable as an
 * analytics property.
 */
type CaptureFailureReason = 'stylesheet' | 'font' | 'blank' | 'canvas' | 'error';

/**
 * Thrown when the capture cannot be made faithful. Callers treat this as "no
 * image", never as "the edit failed".
 */
export class UnfaithfulCaptureError extends Error {
	reason: CaptureFailureReason;

	constructor( message: string, reason: CaptureFailureReason = 'error' ) {
		super( message );
		this.reason = reason;
	}
}

/**
 * Slides the cloned page up so the captured band sits at the frame's origin.
 *
 * The frame the SVG gives us is small and fixed at the origin, so the band of
 * page we want has to be brought to it. `position: relative` shifts the body
 * visually without changing its layout, and the explicit width keeps it laying
 * out at the document's width rather than the frame's.
 * @param clone         The cloned body.
 * @param offsetY       Document y to bring to the top of the frame.
 * @param documentWidth The width the page laid out at.
 */
export const offsetCloneToBand = (
	clone: HTMLElement,
	offsetY: number,
	documentWidth: number
): void => {
	clone.style.width = `${ documentWidth }px`;
	clone.style.position = 'relative';
	clone.style.top = `${ -offsetY }px`;
	// Body margins would shift the page sideways out of a frame that is exactly
	// the document's width.
	clone.style.marginLeft = '0';
	clone.style.marginRight = '0';
};

/**
 * Pins elements that would otherwise be drawn into every band.
 *
 * A full-page capture renders the same document many times, each offset to a
 * different y. Anything positioned against the viewport rather than the
 * document — a fixed header, a sticky nav — pins itself to the frame, so it
 * paints again in every band and the finished image has six copies of the
 * header marching down it.
 *
 * They are re-pinned to the document coordinate where they currently sit, which
 * draws them exactly once. `absolute` rather than `static` keeps them out of
 * flow, so nothing around them shifts.
 * @param liveRoot  The live subtree.
 * @param cloneRoot The clone to modify.
 * @param view      The window the live subtree belongs to.
 */
export const pinViewportPositionedElements = (
	liveRoot: Element,
	cloneRoot: Element,
	view: Window
): void => {
	const scrollX = view.scrollX || 0;
	const scrollY = view.scrollY || 0;
	const liveElements = Array.from( liveRoot.querySelectorAll( '*' ) );
	const cloneElements = Array.from( cloneRoot.querySelectorAll( '*' ) );

	liveElements.forEach( ( liveElement, index ) => {
		const cloneElement = cloneElements[ index ] as HTMLElement | undefined;
		if ( ! cloneElement ) {
			return;
		}

		const position = view.getComputedStyle( liveElement ).position;
		if ( position !== 'fixed' && position !== 'sticky' ) {
			return;
		}

		const box = liveElement.getBoundingClientRect();
		cloneElement.style.position = 'absolute';
		cloneElement.style.top = `${ box.top + scrollY }px`;
		cloneElement.style.left = `${ box.left + scrollX }px`;
		cloneElement.style.width = `${ box.width }px`;
		cloneElement.style.height = `${ box.height }px`;
		cloneElement.style.bottom = 'auto';
		cloneElement.style.right = 'auto';
	} );
};

/**
 * The full laid-out size of the canvas document.
 *
 * The embedded copy has to be given these dimensions rather than the crop's, or
 * it reflows at a different width and stops matching the page it was measured
 * against.
 * @param canvasDocument The canvas document.
 * @param canvasWindow   The canvas window.
 * @returns The document size.
 */
const getDocumentSize = (
	canvasDocument: Document,
	canvasWindow: Window
): { width: number; height: number } => {
	const root = canvasDocument.documentElement;
	const body = canvasDocument.body;

	return {
		width: Math.max( root?.scrollWidth || 0, body?.scrollWidth || 0, canvasWindow.innerWidth || 0 ),
		height: Math.max(
			root?.scrollHeight || 0,
			body?.scrollHeight || 0,
			canvasWindow.innerHeight || 0
		),
	};
};

/**
 * The vertical extent of the edited blocks, in document coordinates.
 * @param canvasDocument The canvas document.
 * @param canvasWindow   The canvas window.
 * @param clientIds      Blocks to frame the capture on.
 * @returns The span, or null when none resolved.
 */
const getEditedSpan = (
	canvasDocument: Document,
	canvasWindow: Window,
	clientIds: string[]
): { top: number; bottom: number; count: number } | null => {
	const scrollY = canvasWindow.scrollY || 0;
	const boxes = clientIds
		.map( ( clientId ) => canvasDocument.querySelector( `[data-block="${ clientId }"]` ) )
		.filter( Boolean )
		.map( ( element ) => ( element as Element ).getBoundingClientRect() )
		// A block scrolled out of view still has a box; a block with no layout
		// (display:none, or detached) does not, and framing on it would show an
		// arbitrary part of the page.
		.filter( ( box ) => box.width > 0 && box.height > 0 );

	if ( ! boxes.length ) {
		return null;
	}

	return {
		top: Math.min( ...boxes.map( ( box ) => box.top ) ) + scrollY,
		bottom: Math.max( ...boxes.map( ( box ) => box.bottom ) ) + scrollY,
		count: boxes.length,
	};
};

/**
 * Whether the edited blocks reach further than a single screenful.
 *
 * A sweeping change — recolouring every heading on the page, say — leaves blocks
 * spread from top to bottom. Centring one band on their midpoint then frames the
 * middle of the document and shows a single screenful of it, quite possibly a
 * stretch where nothing looks different, while the forty other changes go
 * unseen. When the edit is that wide, the whole page is the only honest picture
 * of it.
 * @param canvasDocument The canvas document.
 * @param canvasWindow   The canvas window.
 * @param clientIds      Blocks to frame the capture on.
 * @returns Whether they outgrow the viewport.
 */
export const editOutgrowsViewport = (
	canvasDocument: Document,
	canvasWindow: Window,
	clientIds: string[]
): boolean => {
	const span = getEditedSpan( canvasDocument, canvasWindow, clientIds );

	return !! span && span.bottom - span.top > canvasWindow.innerHeight;
};

/**
 * The region to capture, in canvas document coordinates.
 *
 * Always a full-width band the height of the viewport. Any blocks given decide
 * where that band sits; they never narrow it.
 * @param canvasDocument The canvas document.
 * @param canvasWindow   The canvas window.
 * @param clientIds      Blocks to centre the band on.
 * @returns The region to capture.
 */
export const getCaptureRect = (
	canvasDocument: Document,
	canvasWindow: Window,
	clientIds: string[]
): CaptureRect => {
	const scrollY = canvasWindow.scrollY || 0;
	const width = canvasWindow.innerWidth;
	const height = canvasWindow.innerHeight;
	const documentHeight = getDocumentSize( canvasDocument, canvasWindow ).height;

	// Always a full-width, viewport-tall band. Framing tightly on the blocks
	// produced pictures too small and too close-cropped to answer the questions
	// this exists for — whether a heading crowds what follows it, whether
	// spacing looks right against its neighbours — all of which need to see what
	// surrounds the block. It is also the one geometry that has proven to
	// rasterize reliably.
	const span = getEditedSpan( canvasDocument, canvasWindow, clientIds );

	if ( ! span ) {
		return { x: 0, y: scrollY, width, height, framed: 0 };
	}

	// The blocks decide where to look, never how much. The agent routinely edits
	// something the user has not scrolled to, and a band at the current scroll
	// position would then show an unrelated part of the page — which reads as
	// the edit not having happened.
	const centre = ( span.top + span.bottom ) / 2;

	return {
		x: 0,
		y: Math.max( 0, Math.min( centre - height / 2, documentHeight - height ) ),
		width,
		height,
		framed: span.count,
	};
};

/**
 * Swaps every image in the clone for a box of the same rendered size.
 *
 * Measurements come from the live elements, because the clone is not in a
 * document and has no layout of its own. The two trees are walked in parallel:
 * `cloneNode( true )` preserves document order, so the nth match in one is the
 * nth match in the other.
 * @param liveRoot  The live subtree.
 * @param cloneRoot The clone to modify.
 * @param view      The window the live subtree belongs to.
 */
export const replaceImagesWithPlaceholders = (
	liveRoot: Element,
	cloneRoot: Element,
	view: Window
): void => {
	const liveImages = Array.from( liveRoot.querySelectorAll( 'img' ) );
	const cloneImages = Array.from( cloneRoot.querySelectorAll( 'img' ) );

	liveImages.forEach( ( liveImage, index ) => {
		const cloneImage = cloneImages[ index ] as HTMLElement | undefined;
		if ( ! cloneImage ) {
			return;
		}

		// Pin the box explicitly. Without content, an <img> collapses to its
		// intrinsic size, which would shift everything laid out around it and
		// make the capture misreport the very spacing it exists to show.
		const box = liveImage.getBoundingClientRect();
		cloneImage.setAttribute( 'src', BLANK_PIXEL );
		cloneImage.removeAttribute( 'srcset' );
		cloneImage.removeAttribute( 'sizes' );
		cloneImage.removeAttribute( 'loading' );
		cloneImage.style.width = `${ box.width }px`;
		cloneImage.style.height = `${ box.height }px`;
		cloneImage.style.backgroundColor = PLACEHOLDER_FILL;
	} );

	// CSS background images never appear in the markup, so they have to be found
	// through the cascade. Cover blocks put their photograph here, not in an
	// <img>, so skipping this would leave the single most common image on a
	// page being fetched and tainting the canvas.
	const liveElements = Array.from( liveRoot.querySelectorAll( '*' ) );
	const cloneElements = Array.from( cloneRoot.querySelectorAll( '*' ) );

	liveElements.forEach( ( liveElement, index ) => {
		const cloneElement = cloneElements[ index ] as HTMLElement | undefined;
		if ( ! cloneElement ) {
			return;
		}

		const backgroundImage = view.getComputedStyle( liveElement ).backgroundImage;
		if ( backgroundImage && backgroundImage !== 'none' ) {
			cloneElement.style.backgroundImage = 'none';
			cloneElement.style.backgroundColor = PLACEHOLDER_FILL;
		}
	} );
};

const URL_PATTERN = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;

// `@font-face` carries no nested braces, so matching to the first `}` is enough.
const FONT_FACE_PATTERN = /@font-face\s*\{[^}]*\}/gi;

/**
 * Font data URIs, keyed by the URL they were fetched from.
 *
 * The one thing here that is safe to cache without any invalidation logic: a
 * font file at a given URL does not change. Measured, this is where the time
 * went — fetching and base64-encoding the used faces ran ten times longer than
 * reading all ~12,000 CSS rules, so it is the whole of the win and none of the
 * risk. The rules themselves are deliberately re-read every time, because a
 * theme write rewrites a stylesheet in place and no cheap key catches it.
 */
const fontCache = new Map< string, string >();

/**
 * Forgets the inlined fonts, so the next capture fetches them again.
 *
 * Nothing in normal use needs this — the entries cannot go stale. It exists so
 * tests start from a known state, and so a font can be re-fetched by hand when
 * one is being investigated.
 */
export const clearFontCache = (): void => {
	fontCache.clear();
};

/**
 * Rewrites a sheet's relative `url()` references as absolute.
 *
 * A rule's `cssText` keeps whatever the author wrote, so a theme's
 * `url( fonts/inter.woff2 )` stays relative. Once that text is lifted out of its
 * sheet, there is nothing left to resolve it against: fetching it would resolve
 * against the wp-admin page instead of the stylesheet, 404, and — because fonts
 * fail closed — silently reduce every capture to nothing.
 * @param cssText The sheet's rules.
 * @param baseUrl The URL to resolve against.
 * @returns The rules with absolute urls.
 */
const absolutizeUrls = ( cssText: string, baseUrl: string ): string =>
	cssText.replace( URL_PATTERN, ( match, url ) => {
		if ( url.startsWith( 'data:' ) ) {
			return match;
		}

		try {
			return `url("${ new URL( url, baseUrl ).href }")`;
		} catch {
			return match;
		}
	} );

/**
 * A sheet's rules as text, or null when the browser refuses to hand them over.
 *
 * `cssRules` throws on any sheet the browser considers cross-origin, and a
 * `<link>` written without `crossorigin="anonymous"` is fetched in no-cors mode
 * and counts as cross-origin however permissive the response headers were. So
 * this returning null says nothing about whether the CSS is reachable — only
 * that it is not reachable *this* way. `fetchStyleSheetText` asks again over the
 * network, where the CORS headers actually apply.
 * @param sheet           The sheet to read.
 * @param documentBaseUrl The document's base URL.
 * @returns The rules, or null when they cannot be read.
 */
const readStyleSheetText = ( sheet: CSSStyleSheet, documentBaseUrl: string ): string | null => {
	let rules;

	try {
		rules = sheet.cssRules;
	} catch {
		return null;
	}

	const cssText = Array.from( rules )
		.map( ( rule ) => rule.cssText )
		.join( '\n' );

	// An inline <style> has no href of its own; its urls resolve against the
	// document that holds it.
	return absolutizeUrls( cssText, sheet.href || documentBaseUrl );
};

/**
 * `fetch`, given a deadline.
 *
 * `AbortSignal.timeout` is called optionally on purpose. It is a runtime API,
 * which no bundler polyfills the way it does syntax, and a browser
 * without it would otherwise throw inside the caller's `try` — making every
 * fetch look like a failed one and refusing captures wholesale. Absent, the
 * signal is `undefined`, which `fetch` accepts, and the wait is unbounded as it
 * was before.
 * @param url          What to fetch.
 * @param milliseconds How long to allow.
 * @returns The response.
 */
const fetchWithDeadline = ( url: string, milliseconds: number ): Promise< Response > =>
	fetch( url, { signal: AbortSignal.timeout?.( milliseconds ) } );

/**
 * Refetches a sheet the browser will not let us read.
 *
 * A plain `fetch` is a cors-mode request, so a sheet whose server sends
 * `Access-Control-Allow-Origin` comes back readable even though the `<link>`
 * that loaded it did not. On wpcom that is every canvas stylesheet, and by
 * construction: `_wp_get_iframed_editor_assets()` swaps the global `$wp_styles`
 * for a plain `WP_Styles` before printing the canvas assets, so they never reach
 * the concat emitter — which is the only thing that writes
 * `crossorigin='anonymous'` onto a `<link>`. Gutenberg then puts that markup into
 * the iframe's srcDoc verbatim, so nothing downstream adds it either.
 *
 * Whether a given sheet then *needs* refetching comes down to the host it was
 * given. `staticize_subdomain()` returns a root-relative path for any `.css`,
 * which resolves against the iframe's `<base>` and stays same-origin; it only
 * returns an absolute `s0.wp.com` URL when the request carries
 * `?skip_apex_domain=true` or the host opts out of the apex domain. Those are the
 * captures that were failing.
 *
 * None of this reproduces on a sandbox, which is worth knowing before concluding
 * the fetch is dead code: `staticize_subdomain()` returns early there unless
 * `wpcom_sandbox_staticize_subdomain` is filtered true, so every sheet is
 * same-origin and readable on the first attempt. Reproducing the production shape
 * needs that filter plus `?skip_apex_domain=true`. Concat does not come into it
 * either way, the canvas having bypassed it above.
 *
 * No credentials are sent: `fetch` defaults to same-origin credentials, which is
 * also the only mode compatible with `ACAO: *`.
 * @param href The sheet's URL.
 * @returns The rules, or null when the fetch fails.
 */
const fetchStyleSheetText = async ( href: string ): Promise< string | null > => {
	try {
		const response = await fetchWithDeadline( href, STYLESHEET_FETCH_TIMEOUT );
		if ( ! response.ok ) {
			throw new Error( `HTTP ${ response.status }` );
		}

		return absolutizeUrls( await response.text(), href );
	} catch {
		return null;
	}
};

/**
 * Every stylesheet applying to the canvas, as one block of CSS text.
 *
 * A sheet that can be read neither through `cssRules` nor over the network is
 * dropped rather than failing the capture. That is a real loss of fidelity, and
 * it is still the better trade: a genuinely opaque sheet cannot be inlined by
 * any means, so refusing would mean this page can never be captured at all,
 * while one plugin stylesheet's rules missing leaves the page substantially
 * itself.
 *
 * Losing *every* sheet is the one case where that trade stops holding, and it
 * still refuses: an unstyled render is not a degraded picture of the page but a
 * convincing picture of a different one.
 *
 * Both counts come back with the text. A dropped sheet makes a degraded capture
 * attributable rather than merely suspicious, and a refetched one is the only
 * thing that puts network time inside what is otherwise a pure CPU read — so a
 * `css_read` that suddenly costs hundreds of milliseconds can be explained.
 * Only the tallies are carried, since these end up in `stages`, which is
 * numbers.
 * @param canvasDocument The canvas document.
 * @returns The CSS, and what it cost.
 * @throws When no stylesheet at all could be read.
 */
export const collectStyleText = async (
	canvasDocument: Document
): Promise< { text: string; refetched: number; skipped: number } > => {
	const sheets = Array.from( canvasDocument.styleSheets );
	let refetched = 0;
	let skipped = 0;
	const texts = await Promise.all(
		sheets.map( async ( styleSheet ) => {
			const sheet = styleSheet as CSSStyleSheet;
			const text = readStyleSheetText( sheet, canvasDocument.baseURI );
			if ( text !== null ) {
				return text;
			}

			// An inline sheet cannot be cross-origin, so there is no URL to ask
			// again with and nothing more to try.
			const fetched = sheet.href ? await fetchStyleSheetText( sheet.href ) : null;
			if ( fetched !== null ) {
				refetched++;

				return fetched;
			}

			skipped++;

			return '';
		} )
	);

	if ( sheets.length && skipped === sheets.length ) {
		throw new UnfaithfulCaptureError(
			`Could not read any of the ${ sheets.length } canvas stylesheets`,
			'stylesheet'
		);
	}

	return { text: texts.join( '\n' ), refetched, skipped };
};

// Large enough to make the loop short, small enough to stay well inside the
// argument limit of `apply`.
const BASE64_CHUNK = 0x8000;

/**
 * Base64-encodes bytes.
 *
 * Chunked rather than appending a character at a time: the SVG for a canvas
 * document runs to megabytes, and a per-byte loop over that is its own
 * measurable cost.
 * @param bytes The bytes to encode.
 * @returns The base64 text.
 */
const bytesToBase64 = ( bytes: Uint8Array ): string => {
	let binary = '';

	for ( let index = 0; index < bytes.length; index += BASE64_CHUNK ) {
		binary += String.fromCharCode.apply(
			null,
			Array.from( bytes.subarray( index, index + BASE64_CHUNK ) )
		);
	}

	return btoa( binary );
};

const toBase64 = ( buffer: ArrayBuffer ): string => bytesToBase64( new Uint8Array( buffer ) );

const FONT_FAMILY_PATTERN = /font-family\s*:\s*([^;}]+)/i;

const normalizeFamily = ( family: string ) => family.trim().replace( /['"]/g, '' ).toLowerCase();

/**
 * The font families the canvas has actually put to use.
 *
 * A wpcom editor registers the entire font library, so a document declares
 * hundreds of `@font-face` rules while the page renders with a handful. The
 * browser only loads the ones something needs, so its own font set is the
 * cheapest available answer to "which of these matter".
 * @param canvasDocument The canvas document.
 * @returns Normalized family names.
 */
export const getUsedFontFamilies = ( canvasDocument: Document ): Set< string > => {
	const families = new Set< string >();

	canvasDocument.fonts?.forEach?.( ( font: FontFace ) => {
		// 'unloaded' means nothing on the page has asked for it yet.
		if ( font.status !== 'unloaded' ) {
			families.add( normalizeFamily( font.family ) );
		}
	} );

	return families;
};

/**
 * Rewrites `@font-face` rules so their sources are data URIs.
 *
 * Fonts referenced by URL do not load inside a `<foreignObject>`; the browser
 * substitutes, and substituted metrics break lines in different places. Any font
 * that cannot be fetched therefore fails the capture rather than degrading it.
 * @param styleText    The CSS to rewrite.
 * @param usedFamilies Families to keep; every face is kept when omitted.
 * @returns The CSS with inlined fonts.
 * @throws When a font cannot be fetched.
 */
export const inlineFonts = async (
	styleText: string,
	usedFamilies?: Set< string >
): Promise< string > => {
	// Scoped to `@font-face` on purpose. A page's stylesheets carry `url()` for
	// icon sprites, cursors, and masks too — on a wpcom editor that is hundreds
	// of them across ~12,000 rules. Fetching those would inline exactly the
	// images this rasterizer exists to skip, and would refuse the whole capture
	// the moment any one of them 404s. Non-font urls are left as they are: an
	// SVG loaded through `<img>` cannot fetch external resources anyway, so they
	// silently render as nothing, which is the intended placeholder behaviour.
	//
	// Unused families are dropped outright rather than inlined. Embedding every
	// registered face turned a canvas document's CSS into 123 MB of base64, which
	// is both the dominant cost of a capture and large enough that the renderer
	// never reaches the rules appended after it.
	const isUsed = ( block: string ) => {
		if ( ! usedFamilies ) {
			return true;
		}

		const family = block.match( FONT_FAMILY_PATTERN )?.[ 1 ];

		return !! family && usedFamilies.has( normalizeFamily( family ) );
	};

	const fontFaceBlocks = ( styleText.match( FONT_FACE_PATTERN ) || [] ).filter( isUsed );
	const urls = fontFaceBlocks
		.flatMap( ( block ) =>
			Array.from( block.matchAll( URL_PATTERN ) ).map( ( match ) => match[ 1 ] )
		)
		.filter( ( url ) => ! url.startsWith( 'data:' ) );
	const uniqueUrls = Array.from( new Set( urls ) );

	if ( ! uniqueUrls.length ) {
		return styleText.replace( FONT_FACE_PATTERN, ( block ) => ( isUsed( block ) ? block : '' ) );
	}

	const dataUris = await Promise.all(
		uniqueUrls.map( async ( url ) => {
			const cached = fontCache.get( url );
			if ( cached ) {
				return cached;
			}

			try {
				const response = await fetchWithDeadline( url, FONT_FETCH_TIMEOUT );
				if ( ! response.ok ) {
					throw new Error( `HTTP ${ response.status }` );
				}

				const buffer = await response.arrayBuffer();
				const mimeType = response.headers.get( 'content-type' ) || 'font/woff2';
				const dataUri = `data:${ mimeType };base64,${ toBase64( buffer ) }`;

				// Only successes. A transient failure cached would refuse every
				// capture for the rest of the session.
				fontCache.set( url, dataUri );

				return dataUri;
			} catch ( error ) {
				throw new UnfaithfulCaptureError( `Could not inline font ${ url }: ${ error }`, 'font' );
			}
		} )
	);

	// Rewrite inside the `@font-face` blocks only, so a url that also appears in
	// an unrelated rule is not swapped for a font.
	return styleText.replace( FONT_FACE_PATTERN, ( block ) =>
		isUsed( block )
			? uniqueUrls.reduce(
					( rewritten, url, index ) => rewritten.split( url ).join( dataUris[ index ] ),
					block
				)
			: ''
	);
};

/**
 * The canvas CSS, prepared for embedding: absolute urls and inlined fonts.
 *
 * Deliberately not cached. It was, keyed on the stylesheet count, and that is
 * wrong in exactly the case this feature exists for: a global styles or theme
 * write rewrites the contents of an existing inline sheet and never changes how
 * many sheets there are. The capture then drew the page with the CSS from before
 * the change — reporting the old colours for the very write it was taken to
 * verify, which is worse than not taking it at all.
 *
 * Rebuilding costs a few hundred milliseconds against a capture that already
 * costs a few hundred more, and it is the only way to be sure the picture shows
 * the styles currently in force.
 * @param canvasDocument The canvas document.
 * @param onStats        Receives the read and font timings and the sheet tallies.
 * @returns The prepared CSS.
 * @throws When a font cannot be read.
 */
const getPreparedStyleText = async (
	canvasDocument: Document,
	onStats?: ( stats: { read: number; fonts: number; refetched: number; skipped: number } ) => void
): Promise< string > => {
	const readStartedAt = performance.now();
	const { text: styleText, refetched, skipped } = await collectStyleText( canvasDocument );
	const usedFamilies = getUsedFontFamilies( canvasDocument );
	const read = performance.now() - readStartedAt;

	const fontsStartedAt = performance.now();
	const withFonts = await inlineFonts( styleText, usedFamilies );
	onStats?.( {
		read: Math.round( read ),
		fonts: Math.round( performance.now() - fontsStartedAt ),
		refetched,
		skipped,
	} );

	return withFonts;
};

/**
 * Wraps serialized markup and CSS in an SVG framing one band of the page.
 *
 * The whole body is embedded rather than just the edited blocks: a block's
 * layout depends on its ancestors' widths, so a subtree rendered on its own
 * would wrap differently. Which band of that body shows through the frame is
 * decided by `offsetCloneToBand`, not here.
 * @param markup       Serialized XHTML for the body.
 * @param styleText    CSS to embed.
 * @param frame        The band to render.
 * @param frame.width  Frame width, always the document's.
 * @param frame.height Frame height, the crop's.
 * @returns The SVG document.
 */
export const buildSvg = (
	markup: string,
	styleText: string,
	frame: { width: number; height: number }
): string =>
	[
		// Sized to the band being captured, never to the whole page.
		//
		// Neither SVG-side cropping mechanism works here. A translated `viewBox`
		// shows a region Chrome never painted, and a full-page SVG — 981x5581 on
		// a real site — does not rasterize at all: it comes back entirely blank.
		// Every capture that has ever succeeded had an SVG of roughly viewport
		// size. So the frame stays small and the page is moved behind it instead,
		// by offsetting the body in CSS, which is ordinary overflow painting.
		//
		// The width stays the document's, because the frame is also the initial
		// containing block: narrowing it would resolve `vw` and percentage widths
		// against the crop and reflow the page.
		`<svg xmlns="http://www.w3.org/2000/svg" width="${ frame.width }" height="${ frame.height }">`,
		`<foreignObject x="0" y="0" width="${ frame.width }" height="${ frame.height }">`,
		// CDATA, because the SVG is parsed as XML and CSS is not escaped for it:
		// a single `&` or `<` in 12,000 rules would otherwise fail the parse and
		// the image would simply never decode.
		`<style xmlns="http://www.w3.org/1999/xhtml"><![CDATA[${ styleText }]]></style>`,
		// A separate element, not appended to the page's CSS. Rules tacked onto
		// the end of a very large stylesheet are the first thing lost if the
		// renderer gives up partway, and these are the rules that decide whether
		// any content paints at all.
		`<style xmlns="http://www.w3.org/1999/xhtml"><![CDATA[${ RENDER_OVERRIDES }]]></style>`,
		// The serialized `<body>` goes in as a sibling of the style rather than
		// inside a wrapper. Nested in a `<div>` it is no longer the document
		// body, and rules written against `body` stop applying to it.
		markup,
		'</foreignObject>',
		'</svg>',
	].join( '' );

/**
 * Whether the canvas came out as a handful of flat regions.
 *
 * A half-rasterized `foreignObject` paints container backgrounds and nothing
 * else, which is a plausible-looking image of an empty page. That is the worst
 * thing this could hand an agent: it would read as "the site has no content" and
 * be acted on. Counting distinct sampled colours separates it from a real render
 * cheaply — text and borders produce many colours, flat bands produce a few.
 * @param context       The drawn context.
 * @param width         Canvas width.
 * @param height        Canvas height.
 * @param [region]      A slice to check instead of all of it.
 * @param region.top    Slice top.
 * @param region.height Slice height.
 * @returns Whether it looks unrendered.
 */
const looksUnrendered = (
	context: CanvasRenderingContext2D,
	width: number,
	height: number,
	region?: { top: number; height: number }
): boolean => {
	const { data } = context.getImageData(
		0,
		region ? region.top : 0,
		width,
		region ? region.height : height
	);
	const colours = new Set< string >();

	// Every 64th pixel is plenty to find text, and keeps this well under a
	// millisecond on a 1400px capture.
	for ( let index = 0; index < data.length; index += 4 * 64 ) {
		colours.add(
			`${ data[ index ] },${ data[ index + 1 ] },${ data[ index + 2 ] },${ data[ index + 3 ] }`
		);

		if ( colours.size > DISTINCT_COLOURS_RENDERED ) {
			return false;
		}
	}

	return true;
};

// A background tab pauses frames, so a frame wait is bounded by a timer.
const FRAME_TIMEOUT_MS = 250;

/**
 * Yields until the canvas has painted once more.
 *
 * The canvas window's own `requestAnimationFrame`, so the wait is against the
 * document being measured. A timer stands in where there is none, which is
 * every non-browser caller, and bounds the wait where frames never come.
 * @param view The canvas window.
 * @returns Resolves on the next frame.
 */
const nextFrame = ( view: Window ): Promise< void > =>
	new Promise( ( resolve ) => {
		const request = view.requestAnimationFrame;
		const timer = setTimeout( resolve, typeof request === 'function' ? FRAME_TIMEOUT_MS : 16 );

		if ( typeof request === 'function' ) {
			request.call( view, () => {
				clearTimeout( timer );
				resolve();
			} );
		}
	} );

const settle = ( milliseconds: number ) =>
	nextFrame( window ).then(
		() => new Promise( ( resolve ) => setTimeout( resolve, milliseconds ) )
	);

/**
 * Whether the region being captured should contain visible marks.
 *
 * The blank check exists to catch a half-rasterized render, but a crop can be
 * legitimately flat: recolouring a group's background, or editing a spacer,
 * frames a region with nothing in it. Refusing those would mean never capturing
 * them at all. Asking the source DOM whether there is any text to draw separates
 * "nothing rendered" from "nothing to render".
 * @param canvasDocument The canvas document.
 * @param clientIds      Blocks the capture framed.
 * @returns Whether marks are expected.
 */
const expectsInk = ( canvasDocument: Document, clientIds: string[] ): boolean => {
	const roots: ( Element | null )[] = clientIds.length
		? clientIds
				.map( ( clientId ) => canvasDocument.querySelector( `[data-block="${ clientId }"]` ) )
				.filter( Boolean )
		: [ canvasDocument.body ];

	return roots.some( ( root ) => ( ( root as Element )?.textContent || '' ).trim().length > 0 );
};

/**
 * Yields until the canvas window is idle, so the capture is not taken mid-render.
 * @param view    The canvas window.
 * @param timeout Longest to wait.
 * @returns Resolves when idle, or when the timeout expires.
 */
const whenIdle = ( view: Window, timeout = 500 ): Promise< void > =>
	new Promise( ( resolve ) => {
		const requestIdle = view.requestIdleCallback;

		if ( typeof requestIdle === 'function' ) {
			requestIdle( () => resolve(), { timeout } );
			return;
		}

		nextFrame( view )
			.then( () => nextFrame( view ) )
			.then( resolve );
	} );

/**
 * A fingerprint of where everything on the page currently is.
 * @param canvasDocument The canvas document.
 * @param canvasWindow   The canvas window.
 * @param clientIds      Blocks the capture will frame.
 * @returns The measurement, comparable against another.
 */
const measurePage = (
	canvasDocument: Document,
	canvasWindow: Window,
	clientIds: string[]
): string => {
	const measured = clientIds
		.map( ( clientId ) => canvasDocument.querySelector( `[data-block="${ clientId }"]` ) )
		.filter( Boolean ) as Element[];

	const blocks = Array.from( canvasDocument.querySelectorAll( '[data-block]' ) );
	const step = Math.max( 1, Math.ceil( blocks.length / MOTION_SAMPLE_LIMIT ) );

	for ( let index = 0; index < blocks.length; index += step ) {
		measured.push( blocks[ index ] );
	}

	const boxes = measured.map( ( element ) => {
		const box = element.getBoundingClientRect();

		return `${ Math.round( box.top ) },${ Math.round( box.left ) },${ Math.round(
			box.width
		) },${ Math.round( box.height ) }`;
	} );

	// Scrolling moves every box at once, so it would be noticed anyway. It is
	// included so that a page with no blocks to measure still notices one.
	return `${ canvasWindow.scrollX },${ canvasWindow.scrollY }|${ boxes.join( '|' ) }`;
};

/**
 * Waits for the canvas to stop moving.
 *
 * A capture follows an edit, and an edit is what starts the editor moving: a
 * reordered block springs to its new slot, a replaced pattern slides in, a newly
 * selected block is scrolled to. Captured in the middle of that, a block is
 * cloned carrying the transform it is passing through, and two blocks trading
 * places come out drawn on top of each other — which reads as a broken layout
 * and sends the agent back to redo an edit that was fine.
 *
 * Measured, rather than asked. `getAnimations()` is the obvious way to ask and
 * it is not enough: the editor's own move animation is a `@react-spring`
 * controller writing `transform` inline from a rAF loop, and neither the
 * document nor the element reports that as an animation at all. Watching where
 * the blocks actually are catches it, along with CSS animations, smooth
 * scrolling, and a late reflow — without needing to know which of them is
 * responsible.
 * @param canvasDocument The canvas document.
 * @param canvasWindow   The canvas window.
 * @param clientIds      Blocks the capture will frame.
 * @param timeout        Longest to wait for the motion to end.
 * @returns Resolves when still, or when the timeout expires.
 */
export const whenStill = async (
	canvasDocument: Document,
	canvasWindow: Window,
	clientIds: string[] = [],
	timeout = MOTION_SETTLE_TIMEOUT
): Promise< void > => {
	const startedAt = performance.now();
	const remaining = () => Math.max( 0, timeout - ( performance.now() - startedAt ) );

	let previous = measurePage( canvasDocument, canvasWindow, clientIds );
	let identical = 0;
	let frames = 0;

	while ( remaining() > 0 ) {
		await nextFrame( canvasWindow );

		const current = measurePage( canvasDocument, canvasWindow, clientIds );
		identical = current === previous ? identical + 1 : 0;
		previous = current;
		frames++;

		if ( identical >= MOTION_STABLE_SAMPLES && frames >= MOTION_MINIMUM_FRAMES ) {
			return;
		}
	}
};

/**
 * Decodes an SVG string into an image ready to draw.
 * @param svg The SVG document.
 * @returns The decoded image.
 */
const decodeSvg = async ( svg: string ): Promise< HTMLImageElement > => {
	const image = new window.Image();

	// A data URI, and specifically not an object URL: Chrome treats an SVG
	// loaded from `blob:` as a separate origin, so drawing it taints the canvas
	// and `toBlob` then refuses to export. A data URI inherits this document's
	// origin and draws cleanly.
	//
	// Base64 rather than `encodeURIComponent`, though. With ~12,000 CSS rules the
	// SVG runs to megabytes of `{`, `"`, `<` and spaces, each of which percent-
	// encoding expands to three bytes; base64 is a flat 1.33x and cheaper to
	// produce.
	image.src = `data:image/svg+xml;base64,${ bytesToBase64( new TextEncoder().encode( svg ) ) }`;
	await image.decode();

	return image;
};

const drawToBlob = async (
	svg: string,
	rect: CaptureRect,
	inkExpected: boolean
): Promise< Blob | null > => {
	const scale = Math.min( 1, MAX_LONG_EDGE / Math.max( rect.width, rect.height ) );
	const image = await decodeSvg( svg );

	const canvas = document.createElement( 'canvas' );
	canvas.width = Math.round( rect.width * scale );
	canvas.height = Math.round( rect.height * scale );

	const context = canvas.getContext( '2d', { willReadFrequently: true } );
	if ( ! context ) {
		throw new UnfaithfulCaptureError( 'No 2d context available', 'canvas' );
	}

	// `decode()` resolves before an embedded `foreignObject` has finished laying
	// out its HTML — with megabytes of CSS and data-URI fonts to parse inside the
	// image, that gap is wide enough to catch. Drawing then produces container
	// backgrounds and nothing else, intermittently. Draw, check, and give it
	// longer if it came out flat.
	const toBlob = () =>
		new Promise< Blob | null >( ( resolve ) =>
			canvas.toBlob( resolve, IMAGE_MIME, IMAGE_QUALITY )
		);

	for ( const settleMs of RENDER_SETTLE_STEPS ) {
		await settle( settleMs );
		context.clearRect( 0, 0, canvas.width, canvas.height );
		// Crop from the source image rather than in the SVG: the page is
		// rendered whole, at its own origin, and the region of interest is taken
		// out of it here.
		// Horizontally only. The image is already a full-width band starting at
		// the crop's top, because the embedded page was offset to bring that
		// band to the frame's origin.
		context.drawImage(
			image,
			rect.x,
			0,
			rect.width,
			rect.height,
			0,
			0,
			canvas.width,
			canvas.height
		);

		if ( ! looksUnrendered( context, canvas.width, canvas.height ) ) {
			return toBlob();
		}

		// Flat, but there was nothing in the region to draw. Waiting longer
		// cannot change that.
		if ( ! inkExpected ) {
			return toBlob();
		}
	}

	// Refusing beats returning an image of an empty page, which reads as "this
	// site has no content" to anything that looks at it.
	throw new UnfaithfulCaptureError(
		`The canvas rendered blank after ${ RENDER_SETTLE_STEPS.length } attempts`,
		'blank'
	);
};

/**
 * Splits a page into bands that can each be rasterized on their own.
 *
 * A whole page cannot be rendered in one SVG — 981x5581 comes back blank, which
 * is what forced the band approach in the first place. So a full-page capture is
 * many screenful-sized renders of the same document at different offsets, drawn
 * one under the other.
 * @param documentHeight The page height.
 * @param bandHeight     Height of each band, normally the viewport's.
 * @returns The bands, top to bottom.
 */
export const getBands = (
	documentHeight: number,
	bandHeight: number
): Array< { y: number; height: number } > => {
	if ( bandHeight <= 0 ) {
		return [];
	}

	const bands = [];

	for ( let y = 0; y < documentHeight; y += bandHeight ) {
		bands.push( {
			y,
			// The last band is short rather than overhanging, so the stitched
			// image ends exactly at the foot of the page.
			height: Math.min( bandHeight, documentHeight - y ),
		} );
	}

	return bands;
};

/**
 * The vertical spans of the page that should draw something.
 *
 * Measured once from the live DOM: elements holding their own text, and images,
 * which are placeholder boxes but still paint. Everything else — spacers, the
 * padding between sections, the tail of the document — can legitimately come out
 * blank.
 * @param body The live body.
 * @param view The window it belongs to.
 * @returns Spans in document coordinates.
 */
export const getInkSpans = (
	body: Element,
	view: Window
): Array< { top: number; bottom: number } > => {
	const scrollY = view.scrollY || 0;
	const spans: Array< { top: number; bottom: number } > = [];

	Array.from( body.querySelectorAll( '*' ) ).forEach( ( element ) => {
		// A cover's photograph is a CSS background, drawn as a placeholder.
		const hasBackgroundImage = () => {
			const background = view.getComputedStyle( element ).backgroundImage;

			return !! background && background !== 'none';
		};
		const drawsSomething =
			element.tagName === 'IMG' ||
			Array.from( element.childNodes ).some(
				( node ) => node.nodeType === 3 && ( node.textContent || '' ).trim()
			) ||
			hasBackgroundImage();

		if ( ! drawsSomething ) {
			return;
		}

		const box = element.getBoundingClientRect();
		if ( box.height > 0 ) {
			spans.push( {
				top: box.top + scrollY,
				bottom: box.bottom + scrollY,
			} );
		}
	} );

	return spans;
};

const bandExpectsInk = (
	spans: Array< { top: number; bottom: number } >,
	band: { y: number; height: number }
): boolean => spans.some( ( span ) => span.bottom > band.y && span.top < band.y + band.height );

/**
 * Renders the whole page by rasterizing it in bands and stitching them.
 *
 * Bands are drawn straight into the final, already-scaled canvas rather than
 * into a full-size intermediate, which for a page this tall would run to tens of
 * megabytes before being thrown away.
 *
 * Individual bands are not held to the blank check — the gaps between sections
 * are legitimately empty — but the finished page is, so a systematic rendering
 * failure is still caught.
 * @param clone               The cloned body, reused across bands.
 * @param styleText           CSS to embed.
 * @param documentSize        The page's laid-out size.
 * @param documentSize.width  Page width.
 * @param documentSize.height Page height.
 * @param bandHeight          How much to render at a time.
 * @param inkSpans            Page spans that should draw something.
 * @returns The stitched image.
 */
const drawPageToBlob = async (
	clone: Element,
	styleText: string,
	documentSize: { width: number; height: number },
	bandHeight: number,
	inkSpans: Array< { top: number; bottom: number } >
): Promise< Blob | null > => {
	const bands = getBands( documentSize.height, bandHeight );
	const scale = Math.min( 1, MAX_LONG_EDGE / Math.max( documentSize.width, documentSize.height ) );

	const canvas = document.createElement( 'canvas' );
	canvas.width = Math.round( documentSize.width * scale );
	canvas.height = Math.round( documentSize.height * scale );

	const context = canvas.getContext( '2d', { willReadFrequently: true } );
	if ( ! context ) {
		throw new UnfaithfulCaptureError( 'No 2d context available', 'canvas' );
	}

	for ( const band of bands ) {
		offsetCloneToBand( clone as HTMLElement, band.y, documentSize.width );

		const image = await decodeSvg(
			buildSvg( new window.XMLSerializer().serializeToString( clone ), styleText, {
				width: documentSize.width,
				height: band.height,
			} )
		);

		// Destination edges are rounded from the band's own boundaries rather
		// than from a rounded height, so consecutive bands share an edge exactly
		// and no hairline gap opens between them.
		const top = Math.round( band.y * scale );
		const bottom = Math.round( ( band.y + band.height ) * scale );
		const inkExpected = bandExpectsInk( inkSpans, band );

		// Each band gets the same patience a single capture does: drawing once
		// after a single frame loses whichever band happened not to be ready.
		// Bands over a gap between sections are legitimately empty, and no
		// amount of waiting adds content that is not there.
		let rendered = false;

		for ( const settleMs of RENDER_SETTLE_STEPS ) {
			await settle( settleMs );
			context.clearRect( 0, top, canvas.width, bottom - top );
			context.drawImage(
				image,
				0,
				0,
				documentSize.width,
				band.height,
				0,
				top,
				canvas.width,
				bottom - top
			);

			rendered =
				! inkExpected ||
				! looksUnrendered( context, canvas.width, canvas.height, {
					top,
					height: bottom - top,
				} );

			if ( rendered ) {
				break;
			}
		}

		// Refused rather than kept: on the assembled page one lost band among
		// six is invisible, a result complete apart from a missing section.
		if ( ! rendered ) {
			throw new UnfaithfulCaptureError( `The band at ${ band.y }px rendered blank`, 'blank' );
		}
	}

	if ( looksUnrendered( context, canvas.width, canvas.height ) ) {
		throw new UnfaithfulCaptureError(
			`The page rendered blank across all ${ bands.length } bands`,
			'blank'
		);
	}

	// No quality argument: PNG ignores it, and lossless is the point.
	return new Promise( ( resolve ) => canvas.toBlob( resolve, FULL_PAGE_MIME ) );
};

/**
 * Renders the canvas to a single file part, entirely in the browser; `null`
 * when there is nothing to draw.
 */
export const rasterizeCanvas: CanvasRasterizer = async ( {
	canvasDocument,
	canvasWindow,
	clientIds,
	fullPage,
}: CanvasCaptureContext ) => {
	const body = canvasDocument.body;
	if ( ! body ) {
		return null;
	}

	// A capture usually follows an apply, when the editor is still re-rendering
	// the blocks that just changed. Three things suffer from that: the DOM being
	// cloned is in flux; rasterizing the result competes with the editor for the
	// main thread; and the page is still moving, so a block measures at a box it
	// is only passing through.
	//
	// Idle first, because the motion has not started yet: the editor's move
	// animation is set up in a layout effect, so waiting for the re-render is
	// what makes it observable. Then wait for it to finish. Every measurement
	// below is taken against a page that has stopped.
	await whenIdle( canvasWindow );
	await whenStill( canvasDocument, canvasWindow, clientIds );

	// A band cannot show an edit that reaches past a screenful, so a sweeping
	// change picks the whole page for itself rather than framing the middle of
	// it and leaving the rest unseen.
	const wholePage =
		Boolean( fullPage ) || editOutgrowsViewport( canvasDocument, canvasWindow, clientIds );

	const rect = getCaptureRect( canvasDocument, canvasWindow, clientIds );
	if ( ! rect.width || ! rect.height ) {
		return null;
	}

	const documentSize = getDocumentSize( canvasDocument, canvasWindow );

	// Stage timings, folded into a failure's message so a slow capture can be
	// attributed when the error is inspected.
	const stages: Record< string, number > = {};
	const time = async < T >( name: string, work: () => T | Promise< T > ) => {
		const startedAt = performance.now();
		const value = await work();
		stages[ name ] = Math.round( performance.now() - startedAt );

		return value;
	};

	// Split, because the two halves have different fixes if this ever needs
	// speeding up: reading ~12,000 rules is CPU, and inlining fonts is fetches
	// and base64. Caching the first needs invalidation that catches a stylesheet
	// rewritten in place; caching the second needs none at all, since a font at
	// a given URL never changes.
	const styleText = await time( 'css', () =>
		getPreparedStyleText( canvasDocument, ( stats ) => {
			stages.css_read = stats.read;
			stages.css_fonts = stats.fonts;
			// Only when there were any, so an ordinary capture's stages keep
			// exactly the shape they had.
			if ( stats.refetched ) {
				stages.css_refetched_sheets = stats.refetched;
			}
			if ( stats.skipped ) {
				stages.css_skipped_sheets = stats.skipped;
			}
		} )
	);
	const clone = await time( 'clone', () => {
		const cloned = body.cloneNode( true ) as Element;
		replaceImagesWithPlaceholders( body, cloned, canvasWindow );

		// Only for a full page. A single band renders the document once, so a
		// viewport-positioned element lands where it belongs; it is repeated
		// renders that duplicate it.
		if ( wholePage ) {
			pinViewportPositionedElements( body, cloned, canvasWindow );
		}

		offsetCloneToBand( cloned as HTMLElement, rect.y, documentSize.width );

		return cloned;
	} );

	// Everything needed to explain a failure, gathered before the draw. A blank
	// render says nothing on its own; the crop, the document it was measured
	// against, and whether the requested blocks even resolved say a great deal.
	const diagnostics = {
		rect,
		documentSize,
		clientIds,
		wholePage,
		resolvedBlocks: clientIds.filter( ( clientId ) =>
			canvasDocument.querySelector( `[data-block="${ clientId }"]` )
		).length,
		scroll: { x: canvasWindow.scrollX, y: canvasWindow.scrollY },
		cssBytes: styleText.length,
	};

	const blob = await time( 'render', async () => {
		try {
			// A full page serializes the clone once per band as it draws.
			if ( wholePage ) {
				return await drawPageToBlob(
					clone,
					styleText,
					documentSize,
					rect.height,
					getInkSpans( body, canvasWindow )
				);
			}

			// XMLSerializer, not innerHTML: `<foreignObject>` content must be
			// well-formed XML, and HTML serialization leaves void elements unclosed
			// and bare ampersands unescaped.
			const markup = await time( 'serialize', () =>
				new window.XMLSerializer().serializeToString( clone )
			);

			// The frame is a full-width band at the crop's height. Vertical
			// positioning is done by the offset above; the horizontal crop is taken
			// at draw time.
			const svg = buildSvg( markup, styleText, {
				width: documentSize.width,
				height: rect.height,
			} );

			return await drawToBlob( svg, rect, expectsInk( canvasDocument, clientIds ) );
		} catch ( error ) {
			// Re-thrown with the context gathered above, so the one error that
			// leaves here carries what is needed to diagnose it.
			throw new UnfaithfulCaptureError(
				`${ ( error as Error ).message } — ${ JSON.stringify( {
					...diagnostics,
					stages,
				} ) }`,
				( error as UnfaithfulCaptureError ).reason || 'error'
			);
		}
	} );

	if ( ! blob ) {
		return null;
	}

	const bytes = await time( 'encode', async () => toBase64( await blob.arrayBuffer() ) );

	return [
		{
			type: 'file',
			file: {
				name: wholePage ? 'canvas-page.png' : 'canvas.webp',
				mimeType: wholePage ? FULL_PAGE_MIME : IMAGE_MIME,
				bytes,
			},
			// Images are placeholders, so a reader of this capture must not
			// conclude the page's photographs are missing or broken.
			metadata: { imagesArePlaceholders: true, fullPage: wholePage, framed: rect.framed },
		},
	] as FilePart[];
};
