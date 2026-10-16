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

interface Measured {
	clientId: string;
	text: Rgba;
	backdrop: Backdrop;
	ratio: number;
	needs: number;
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

/** The element directly holding the block's first visible text, a button's link or a span among them. */
function findTextElement( blockElement: Element, view: Window ): Element | null {
	for ( let element: Element | null = blockElement; element; element = element.parentElement ) {
		if ( ! isDisplayed( element, view ) ) {
			return null;
		}
	}

	const walker = blockElement.ownerDocument.createTreeWalker( blockElement, NodeFilter.SHOW_TEXT );

	for ( let node = walker.nextNode(); node; node = walker.nextNode() ) {
		const parent = node.parentElement;

		if ( ! node.textContent?.trim() || ! parent || parent.closest( EDITOR_UI ) ) {
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

		if ( ! hidden ) {
			return parent;
		}
	}

	return null;
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

/** The edited blocks and their descendants that hold no blocks of their own. */
function collectLeaves( clientIds: string[] ): string[] {
	const leaves: string[] = [];
	const visited = new Set< string >();

	const walk = ( clientId: string ) => {
		if ( visited.has( clientId ) || visited.size >= MAX_VISITED ) {
			return;
		}

		visited.add( clientId );

		const children = getBlocks( clientId );

		if ( ! children.length ) {
			leaves.push( clientId );

			return;
		}

		children.forEach( ( child ) => walk( child.clientId ) );
	};

	clientIds.forEach( walk );

	return leaves;
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
 * each kind of failure, worst first, or one note that all of it passes, and a
 * note counting the blocks whose backdrop could not be read. A block with no
 * visible text is skipped, and a canvas that is not mounted gives nothing.
 * Never throws: the notes ride along with an edit and must not fail it.
 * @param clientIds The edited blocks.
 * @returns Capture notes, one sentence or so each.
 */
export function describeTextContrast( clientIds: string[] ): string[] {
	try {
		return measureTextContrast( clientIds );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Failed to measure the text contrast:', error );

		return [];
	}
}

function measureTextContrast( clientIds: string[] ): string[] {
	const canvasDocument = clientIds.length ? getCanvasDocument() : null;
	const view = canvasDocument?.defaultView;

	if ( ! canvasDocument || ! view ) {
		return [];
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
	let capped = false;

	for ( const clientId of collectLeaves( clientIds ) ) {
		const blockElement = canvasDocument.querySelector( `[data-block="${ clientId }"]` );
		const textElement = blockElement && findTextElement( blockElement, view );

		if ( ! textElement ) {
			continue;
		}

		if ( ++textBlocks > MAX_TEXT_BLOCKS ) {
			capped = true;
			break;
		}

		const style = view.getComputedStyle( textElement );
		const colour = parseColour( style.color );
		const backdrop = isFaded( textElement, view ) ? null : findBackdrop( textElement, view );

		if ( ! colour || ! backdrop ) {
			unmeasured++;
			continue;
		}

		const text = composite( colour, backdrop.colour );

		measured.push( {
			clientId,
			text,
			backdrop,
			ratio: contrastRatio( text, backdrop.colour ),
			needs: isLargeText( style ) ? MIN_LARGE_RATIO : MIN_RATIO,
		} );
	}

	const failures = new Map< string, Measured[] >();

	measured
		.filter( ( item ) => item.ratio < item.needs )
		.forEach( ( item ) => {
			const key = [
				toHex( item.text ),
				toHex( item.backdrop.colour ),
				item.backdrop.clientId ?? '',
			].join( '|' );

			failures.set( key, [ ...( failures.get( key ) ?? [] ), item ] );
		} );

	const notes = [ ...failures.values() ]
		.map( ( items ) => ( {
			items,
			worst: Math.min( ...items.map( ( item ) => item.ratio ) ),
		} ) )
		.sort( ( a, b ) => a.worst - b.worst )
		.slice( 0, MAX_NOTES )
		.map( ( { items, worst } ) => {
			// One set of colours, so one ratio; the strictest threshold among them.
			const [ { text, backdrop } ] = items;
			const needs = Math.max( ...items.map( ( item ) => item.needs ) );
			const backdropHex = toHex( backdrop.colour );
			let source: string;

			if ( ! backdrop.clientId ) {
				source = `The ${ backdropHex } comes from the page background.`;
			} else if ( setsOwnBackground( backdrop.clientId ) ) {
				source = `The ${ backdropHex } comes from ${ labelOf( backdrop.clientId ) }'s own background.`;
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

	// Past the cap, some edited text went unread, so "all" would overclaim.
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

	return notes;
}
