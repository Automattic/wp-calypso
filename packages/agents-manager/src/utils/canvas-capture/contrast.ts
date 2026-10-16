/**
 * How the edited text reads against what renders behind it, as sentences for
 * the capture notes.
 *
 * A block's attributes say only what the block sets. An inner group with no
 * background of its own can still render dark from the theme or global
 * styles, and text set dark on the section around it then sits dark on dark.
 * A scaled-down picture makes that easy to miss, so the colours are read from
 * the canvas and the contrast stated outright.
 *
 * The visual check takes these notes as fact, so a colour that cannot be read
 * is left out rather than guessed: a wrong "readable" is worse than no note.
 */

import { createShortIdLookup } from '../block-ids';
import { getBlock, getBlocks } from '../editor-blocks';
import { getCanvasDocument } from '../editor-canvas';

const MAX_TEXT_BLOCKS = 40;
// Text runs read in one block: a paragraph's links, spans and highlights.
const MAX_RUNS = 20;
const MAX_VISITED = 300;
const MAX_NOTES = 4;
const MAX_NAMED = 3;

// WCAG 2.x: 4.5:1 for body text, 3:1 for large text, which is 24px, or
// 18.66px (14pt) when bold.
const MIN_RATIO = 4.5;
const MIN_LARGE_RATIO = 3;
const LARGE_SIZE = 24;
const LARGE_BOLD_SIZE = 18.66;
const BOLD_WEIGHT = 700;

interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
const TRANSPARENT: Rgba = { r: 0, g: 0, b: 0, a: 0 };

// Media laid out over a background, as a cover block's image or video is.
const OVERLAY_MEDIA = new Set( [ 'img', 'video', 'picture', 'canvas', 'svg', 'iframe' ] );

// The editor's own interface inside a block, which the page does not show:
// an empty block's placeholder, an invalid block's warning, an appender.
const EDITOR_UI = '.components-placeholder, .block-editor-warning, .block-list-appender';

interface Backdrop {
	colour: Rgba;
	/** The block whose element painted the backdrop, if any did. */
	clientId?: string;
}

/** The capture notes on the edited text's contrast, and how many of its blocks fall below their threshold. */
export interface TextContrast {
	notes: string[];
	/**
	 * Measured blocks below their threshold; blocks that could not be measured
	 * do not count. `null` when none could be measured, so 0 always means
	 * measured and readable.
	 */
	failures: number | null;
}

/** One run of text: the colours it renders in, and the threshold it is held to. */
interface Run {
	text: Rgba;
	backdrop: Backdrop;
	ratio: number;
	needs: number;
}

/** A block, by the run that speaks for it: its worst failing one, or else its weakest. */
interface Measured extends Run {
	clientId: string;
}

const clamp = ( value: number, min: number, max: number ): number =>
	Math.min( max, Math.max( min, value ) );

/** A channel or alpha value, as a fraction of `scale` when given as a percentage. */
function parseNumber( value: string, scale: number ): number | null {
	const isPercent = value.endsWith( '%' );
	const number = Number( isPercent ? value.slice( 0, -1 ) : value );

	if ( value === '' || Number.isNaN( number ) ) {
		return null;
	}

	return isPercent ? ( number / 100 ) * scale : number;
}

/**
 * A computed colour, as browsers serialise it: `rgb()` and `rgba()` in comma
 * or space syntax, `color(srgb r g b / a)` from `color-mix()`, and
 * `transparent`. `null` for anything else.
 */
function parseColour( value: string ): Rgba | null {
	const colour = value.trim().toLowerCase();

	if ( colour === 'transparent' ) {
		return TRANSPARENT;
	}

	const match =
		/^rgba?\(\s*([^)]*)\)$/.exec( colour ) ?? /^color\(\s*srgb\s+([^)]*)\)$/.exec( colour );

	if ( ! match ) {
		return null;
	}

	const scale = colour.startsWith( 'color' ) ? 1 : 255;
	const [ channels, slashAlpha ] = match[ 1 ].split( '/' );
	const parts = channels.trim().split( /\s*,\s*|\s+/ );
	const [ r, g, b ] = parts.slice( 0, 3 ).map( ( part ) => parseNumber( part, scale ) );
	const a = parseNumber( slashAlpha?.trim() ?? parts[ 3 ] ?? '1', 1 );

	if (
		parts.length < 3 ||
		parts.length > ( slashAlpha === undefined ? 4 : 3 ) ||
		r === null ||
		g === null ||
		b === null ||
		a === null
	) {
		return null;
	}

	const toByte = ( channel: number ) => clamp( ( channel / scale ) * 255, 0, 255 );

	return { r: toByte( r ), g: toByte( g ), b: toByte( b ), a: clamp( a, 0, 1 ) };
}

/** `top` laid over a solid `bottom`. */
function composite( top: Rgba, bottom: Rgba ): Rgba {
	const mix = ( over: number, under: number ) => over * top.a + under * ( 1 - top.a );

	return { r: mix( top.r, bottom.r ), g: mix( top.g, bottom.g ), b: mix( top.b, bottom.b ), a: 1 };
}

function luminance( { r, g, b }: Rgba ): number {
	const linear = ( channel: number ) => {
		const value = channel / 255;

		return value <= 0.04045 ? value / 12.92 : ( ( value + 0.055 ) / 1.055 ) ** 2.4;
	};

	return 0.2126 * linear( r ) + 0.7152 * linear( g ) + 0.0722 * linear( b );
}

function contrastRatio( a: Rgba, b: Rgba ): number {
	const [ lighter, darker ] = [ luminance( a ), luminance( b ) ].sort( ( x, y ) => y - x );

	return ( lighter + 0.05 ) / ( darker + 0.05 );
}

const toHex = ( { r, g, b }: Rgba ): string =>
	'#' +
	[ r, g, b ]
		.map( ( channel ) => Math.round( channel ).toString( 16 ).padStart( 2, '0' ) )
		.join( '' )
		.toUpperCase();

// Rounded down, so a ratio just short of the threshold never prints as meeting it.
const formatRatio = ( ratio: number ): string => `${ Math.floor( ratio * 100 ) / 100 }:1`;

const hasBackgroundImage = ( style: CSSStyleDeclaration ): boolean =>
	!! style.backgroundImage && style.backgroundImage !== 'none';

// Browsers read an unset background as transparent; jsdom reads it empty.
const readBackground = ( style: CSSStyleDeclaration ): Rgba | null =>
	style.backgroundColor ? parseColour( style.backgroundColor ) : TRANSPARENT;

/** Whether a box paints anything: an image or gradient, or a colour that is not transparent or cannot be read. */
const paints = ( style: CSSStyleDeclaration ): boolean =>
	hasBackgroundImage( style ) || ( readBackground( style )?.a ?? 1 ) > 0;

const isPositioned = ( style: CSSStyleDeclaration ): boolean =>
	style.position === 'absolute' || style.position === 'fixed';

const isSet = ( value: string ): boolean =>
	!! value && value !== 'auto' && value !== 'none' && value !== 'normal';

/** Whether the element is not seen: not displayed, invisible, or clipped away for screen readers alone. */
function isUnseen( element: Element, view: Window ): boolean {
	const style = view.getComputedStyle( element );

	return (
		style.display === 'none' ||
		style.visibility === 'hidden' ||
		( isPositioned( style ) && ( isSet( style.clip ) || isSet( style.clipPath ) ) )
	);
}

const isDisplayed = ( element: Element, view: Window ): boolean =>
	view.getComputedStyle( element ).display !== 'none';

/**
 * The elements directly holding the block's visible text, each once, in
 * document order: the block's own element, its links, spans and highlights,
 * a button's link. Text inside a nested block is that block's, so it is left
 * for that block to be measured by, and counted once. `truncated` when the
 * block held more than are read.
 */
function findTextElements(
	blockElement: Element,
	view: Window
): { elements: Element[]; truncated: boolean } {
	const elements = new Set< Element >();

	for ( let element: Element | null = blockElement; element; element = element.parentElement ) {
		if ( ! isDisplayed( element, view ) ) {
			return { elements: [], truncated: false };
		}
	}

	const walker = blockElement.ownerDocument.createTreeWalker(
		blockElement,
		NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
		{
			acceptNode: ( node ) => {
				if ( node.nodeType === Node.TEXT_NODE ) {
					return NodeFilter.FILTER_ACCEPT;
				}

				return ( node as Element ).hasAttribute( 'data-block' )
					? NodeFilter.FILTER_REJECT
					: NodeFilter.FILTER_SKIP;
			},
		}
	);

	for ( let node = walker.nextNode(); node; node = walker.nextNode() ) {
		const parent = node.parentElement;

		if (
			! node.textContent?.trim() ||
			! parent ||
			elements.has( parent ) ||
			parent.closest( EDITOR_UI )
		) {
			continue;
		}

		let hidden = false;

		for ( let element: Element | null = parent; element; element = element.parentElement ) {
			if ( isUnseen( element, view ) ) {
				hidden = true;
				break;
			}

			if ( element === blockElement ) {
				break;
			}
		}

		if ( hidden ) {
			continue;
		}

		if ( elements.size >= MAX_RUNS ) {
			return { elements: [ ...elements ], truncated: true };
		}

		elements.add( parent );
	}

	return { elements: [ ...elements ], truncated: false };
}

const hasSize = ( rect: DOMRect ): boolean => rect.width > 0 && rect.height > 0;

const intersects = ( a: DOMRect, b: DOMRect ): boolean =>
	a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * Whether something off the text's own ancestry is laid out over the
 * element's background, behind the text: a positioned child that paints or
 * is media, as a cover block's overlay and image are, or a positioned
 * pseudo-element that paints. Its colour is not on the path the backdrop is
 * read from. A child whose box is clear of the text's is no overlay; one
 * whose box cannot be read, nor a pseudo-element's, is taken to be.
 */
function hasOverlay(
	element: Element,
	pathChild: Element | null,
	textRect: DOMRect,
	view: Window
): boolean {
	const overlaid = Array.from( element.children ).some( ( child ) => {
		if ( child === pathChild ) {
			return false;
		}

		const style = view.getComputedStyle( child );

		if (
			style.display === 'none' ||
			! isPositioned( style ) ||
			! ( OVERLAY_MEDIA.has( child.localName ) || paints( style ) )
		) {
			return false;
		}

		const rect = child.getBoundingClientRect();

		return ! hasSize( rect ) || ! hasSize( textRect ) || intersects( rect, textRect );
	} );

	return (
		overlaid ||
		[ '::before', '::after' ].some( ( pseudo ) => {
			const style = view.getComputedStyle( element, pseudo );

			return isSet( style.content ) && isPositioned( style ) && paints( style );
		} )
	);
}

/** Whether the element or anything around it is drawn faded, which its colours do not show. */
function isFaded( element: Element, view: Window ): boolean {
	for ( let current: Element | null = element; current; current = current.parentElement ) {
		const opacity = parseFloat( view.getComputedStyle( current ).opacity );

		if ( opacity < 1 ) {
			return true;
		}
	}

	return false;
}

/**
 * What renders behind an element: the backgrounds of it and its ancestors,
 * layered until one is solid, over white when none is. `null` when an image,
 * gradient or overlay sits in the way, or a colour cannot be read.
 */
function findBackdrop( element: Element, view: Window ): Backdrop | null {
	const layers: Rgba[] = [];
	let painter: Element | undefined;
	let colour: Rgba | undefined;
	let pathChild: Element | null = null;
	const textRect = element.getBoundingClientRect();

	for (
		let current: Element | null = element;
		current;
		pathChild = current, current = current.parentElement
	) {
		const style = view.getComputedStyle( current );

		if ( hasBackgroundImage( style ) || hasOverlay( current, pathChild, textRect, view ) ) {
			return null;
		}

		const background = readBackground( style );

		if ( ! background ) {
			return null;
		}

		if ( background.a === 0 ) {
			continue;
		}

		painter ??= current;

		if ( background.a >= 1 ) {
			colour = background;
			break;
		}

		layers.push( background );
	}

	const backdrop = layers.reduceRight(
		( under, over ) => composite( over, under ),
		colour ?? WHITE
	);
	const clientId = painter?.closest( '[data-block]' )?.getAttribute( 'data-block' ) ?? undefined;

	return { colour: backdrop, clientId };
}

function isLargeText( style: CSSStyleDeclaration ): boolean {
	const size = parseFloat( style.fontSize );
	const weight = style.fontWeight === 'bold' ? BOLD_WEIGHT : parseFloat( style.fontWeight );

	return size >= LARGE_SIZE || ( size >= LARGE_BOLD_SIZE && weight >= BOLD_WEIGHT );
}

/** A run's colours against what renders behind it, or `null` when either cannot be read. */
function measureRun( element: Element, view: Window ): Run | null {
	const style = view.getComputedStyle( element );
	const colour = parseColour( style.color );
	const backdrop = isFaded( element, view ) ? null : findBackdrop( element, view );

	if ( ! colour || ! backdrop ) {
		return null;
	}

	const text = composite( colour, backdrop.colour );

	return {
		text,
		backdrop,
		ratio: contrastRatio( text, backdrop.colour ),
		needs: isLargeText( style ) ? MIN_LARGE_RATIO : MIN_RATIO,
	};
}

// How far a run sits from its threshold: below 1 fails, and the lowest is the worst.
const margin = ( run: Run ): number => run.ratio / run.needs;

/** Whether the block sets a background of its own, rather than inheriting one from the theme. */
function setsOwnBackground( clientId: string ): boolean {
	const attributes = getBlock( clientId )?.attributes ?? {};
	const style = attributes.style as { color?: { background?: unknown; gradient?: unknown } };

	return Boolean(
		attributes.backgroundColor ||
		attributes.gradient ||
		style?.color?.background ||
		style?.color?.gradient
	);
}

/**
 * The edited blocks and their descendants, each parent before its children,
 * and whether the walk stopped short of them all. Parents count too: a
 * details block's summary and a list item's text are their own, not a child's.
 */
function collectBlocks( clientIds: string[] ): { blocks: string[]; truncated: boolean } {
	const visited = new Set< string >();
	let truncated = false;

	const walk = ( clientId: string ) => {
		if ( visited.has( clientId ) ) {
			return;
		}

		if ( visited.size >= MAX_VISITED ) {
			truncated = true;

			return;
		}

		visited.add( clientId );
		getBlocks( clientId ).forEach( ( child ) => walk( child.clientId ) );
	};

	clientIds.forEach( walk );

	return { blocks: [ ...visited ], truncated };
}

function listLabels( labels: string[] ): string {
	const named = labels.slice( 0, MAX_NAMED );
	const rest = labels.length - named.length;

	if ( rest > 0 ) {
		return `${ named.join( ', ' ) } and ${ rest } more`;
	}

	return named.length > 1
		? `${ named.slice( 0, -1 ).join( ', ' ) } and ${ named[ named.length - 1 ] }`
		: named[ 0 ];
}

/**
 * The contrast of the edited text against what renders behind it: a note for
 * each kind of failure, worst first, or one note that all of it passes unless
 * a cap cut the reading short, and a note counting the blocks whose backdrop
 * could not be read; with the number of blocks that fail, which the server
 * reads rather than the wording. A block with no visible text is skipped.
 * Never throws: the notes ride along with an edit and must not fail it.
 * @param clientIds The edited blocks.
 * @returns The notes and the count, or `null` when there is no canvas, no
 * text to measure, or the measuring failed.
 */
export function describeTextContrast( clientIds: string[] ): TextContrast | null {
	try {
		return measureTextContrast( clientIds );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Failed to measure the text contrast:', error );

		return null;
	}
}

function measureTextContrast( clientIds: string[] ): TextContrast | null {
	const canvasDocument = clientIds.length ? getCanvasDocument() : null;
	const view = canvasDocument?.defaultView;

	if ( ! canvasDocument || ! view ) {
		return null;
	}

	const { findShortId } = createShortIdLookup();
	const labelOf = ( clientId: string ): string => {
		const shortName = ( getBlock( clientId )?.name ?? 'block' ).replace( /^core\//, '' );
		const shortId = findShortId( clientId );

		return shortId ? `${ shortName } (${ shortId })` : shortName;
	};

	const measured: Measured[] = [];
	let unmeasured = 0;
	let textBlocks = 0;
	const { blocks, truncated } = collectBlocks( clientIds );
	let capped = truncated;

	for ( const clientId of blocks ) {
		const blockElement = canvasDocument.querySelector( `[data-block="${ clientId }"]` );
		const { elements, truncated: tooManyRuns } = blockElement
			? findTextElements( blockElement, view )
			: { elements: [], truncated: false };

		if ( ! elements.length ) {
			continue;
		}

		if ( ++textBlocks > MAX_TEXT_BLOCKS ) {
			capped = true;
			break;
		}

		const runs = elements.map( ( element ) => measureRun( element, view ) );
		const read = runs
			.filter( ( run ): run is Run => !! run )
			.sort( ( a, b ) => margin( a ) - margin( b ) );
		const [ worst ] = read;

		// One failing run fails the block. A block passes only when every run
		// of it was read and passes; otherwise it is left to the picture.
		if ( worst && margin( worst ) < 1 ) {
			measured.push( { clientId, ...worst } );
		} else if ( ! worst || read.length < runs.length || tooManyRuns ) {
			unmeasured++;
		} else {
			measured.push( { clientId, ...worst } );
		}
	}

	if ( ! textBlocks ) {
		return null;
	}

	const failing = measured.filter( ( item ) => item.ratio < item.needs );
	const failures = new Map< string, Measured[] >();
	const ownBackground = new Map< string, boolean >();
	const isOwnBackground = ( clientId: string ): boolean => {
		if ( ! ownBackground.has( clientId ) ) {
			ownBackground.set( clientId, setsOwnBackground( clientId ) );
		}

		return ownBackground.get( clientId ) ?? false;
	};

	// Blocks that set the same background, as a row of buttons does, are one
	// fix, so they share a note. A backdrop from the theme is grouped by the
	// block it renders on, which is where a fix would go.
	failing.forEach( ( item ) => {
		const painter = item.backdrop.clientId;
		const key = [
			toHex( item.text ),
			toHex( item.backdrop.colour ),
			painter && isOwnBackground( painter ) ? 'own' : ( painter ?? '' ),
		].join( '|' );

		failures.set( key, [ ...( failures.get( key ) ?? [] ), item ] );
	} );

	const listed = [ ...failures.values() ]
		.map( ( items ) => ( {
			items,
			worst: Math.min( ...items.map( ( item ) => item.ratio ) ),
		} ) )
		.sort( ( a, b ) => a.worst - b.worst )
		.slice( 0, MAX_NOTES );

	const notes = listed.map( ( { items, worst } ) => {
		// One set of colours, so one ratio; the strictest threshold among them.
		const [ { text, backdrop } ] = items;
		const needs = Math.max( ...items.map( ( item ) => item.needs ) );
		const backdropHex = toHex( backdrop.colour );
		const painters = [ ...new Set( items.map( ( item ) => item.backdrop.clientId ?? '' ) ) ].filter(
			Boolean
		);
		let source: string;

		if ( ! backdrop.clientId ) {
			source = `The ${ backdropHex } comes from the page background.`;
		} else if ( isOwnBackground( backdrop.clientId ) ) {
			if ( painters.length === 1 ) {
				source = `The ${ backdropHex } comes from ${ labelOf( painters[ 0 ] ) }'s own background.`;
			} else if ( items.every( ( item ) => item.backdrop.clientId === item.clientId ) ) {
				source = `The ${ backdropHex } comes from each block's own background.`;
			} else {
				source = `The ${ backdropHex } comes from the own backgrounds of ${ listLabels(
					painters.map( labelOf )
				) }.`;
			}
		} else {
			source = `The ${ backdropHex } comes from ${ labelOf(
				backdrop.clientId
			) }, which sets no background of its own, so the colour comes from the theme or global styles.`;
		}

		return `Text contrast too low: ${ listLabels(
			items.map( ( item ) => labelOf( item.clientId ) )
		) } — ${ toHex( text ) } text on ${ backdropHex }, ${ formatRatio( worst ) } (needs ${ formatRatio(
			needs
		) }). ${ source }`;
	} );

	// So a count above the notes never comes with a list that looks complete.
	const unlisted =
		failing.length - listed.reduce( ( count, { items } ) => count + items.length, 0 );

	if ( unlisted > 0 ) {
		notes.push(
			`Text contrast too low for ${ unlisted } more edited text block(s) not listed above.`
		);
	}

	// Past either cap, some edited text went unread, so "all" would overclaim.
	if ( ! notes.length && measured.length && ! capped ) {
		notes.push(
			`Text contrast: all ${ measured.length } edited text block(s) measure at least 4.5:1 (3:1 for large text) against what renders behind them.`
		);
	}

	if ( unmeasured ) {
		notes.push(
			`Contrast could not be measured for ${ unmeasured } edited text block(s), whose text sits over an image or gradient or uses a colour that cannot be read; judge those from the picture.`
		);
	}

	return { notes, failures: measured.length ? failing.length : null };
}
