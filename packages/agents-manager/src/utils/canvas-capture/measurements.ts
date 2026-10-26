/**
 * What the canvas measures around an edit, as sentences for the capture notes.
 *
 * A picture of a row that looks centred can be off by a few dozen pixels, and
 * a block can be centred while the image inside it sits at its top: the
 * block's box says aligned, the eye says not. Neither is reliable from pixels
 * alone, so the boxes are read from the layout and stated outright.
 *
 * The visual check takes these notes as fact, so a box that cannot be read
 * is left out rather than guessed: a wrong "level" is worse than no note.
 */

import { createShortIdLookup } from '../block-ids';
import { getBlock, getBlockRootClientId, getBlocks } from '../editor-blocks';
import { getCanvasDocument } from '../editor-canvas';

// Below this, a difference is rounding and subpixel layout, not misalignment.
const TOLERANCE = 2;
const MAX_ROWS = 4;
const MAX_ROW_ITEMS = 8;
const MAX_IMAGE_NOTES = 6;
// How far below an edited block a row is still looked for. The row that is
// off is often a grandchild of the block the edit named: a header's logo and
// title sit in a group inside a group.
const MAX_ROW_DEPTH = 4;
// Images are looked for at any depth, so the walk itself is bounded by count.
const MAX_VISITED = 300;

// Blocks whose content is their image. In the editor the image sits inside a
// resize container sized to the block's width, so the block's own box, and
// the container's, say nothing of what the image shows once CSS shrinks it.
const IMAGE_BLOCKS = new Set( [ 'core/site-logo', 'core/image' ] );

interface Box {
	top: number;
	bottom: number;
	left: number;
	right: number;
	width: number;
	height: number;
}

interface Measured {
	clientId: string;
	label: string;
	/** The block's own box. */
	block: Box;
	/** Whether the block's content is an image. */
	isImageBlock: boolean;
	/** The image's box, for an image block whose image could be measured. */
	image?: Box;
	/** Whether the block paints its own box: a background, border or shadow. */
	paints: boolean;
}

/** A visible box; `hidden` for a block with no layout, `unknown` for one that cannot be read. */
type Visible = Box | 'hidden' | 'unknown';

interface Row {
	parent: Measured;
	items: Measured[];
	boxes: Box[];
	/** Whether an item is an image block, the case a block's box misreports most. */
	holdsImage: boolean;
}

const px = ( value: number ): number => Math.round( value );

const centreOf = ( box: Box ): number => ( box.top + box.bottom ) / 2;

const isBox = ( visible: Visible ): visible is Box => typeof visible !== 'string';

function union( boxes: Box[] ): Box {
	const top = Math.min( ...boxes.map( ( box ) => box.top ) );
	const bottom = Math.max( ...boxes.map( ( box ) => box.bottom ) );
	const left = Math.min( ...boxes.map( ( box ) => box.left ) );
	const right = Math.max( ...boxes.map( ( box ) => box.right ) );

	return { top, bottom, left, right, width: right - left, height: bottom - top };
}

/**
 * Boxes in the canvas's own CSS pixels, from the top of its document, so a
 * scroll between two readings is not a move. Zoomed-out editing scales the
 * canvas with a transform, which the bounding rect includes and the layout
 * width does not.
 */
function toBox( rect: DOMRect, scale: number, scrollX: number, scrollY: number ): Box {
	return {
		top: ( rect.top + scrollY ) / scale,
		bottom: ( rect.bottom + scrollY ) / scale,
		left: ( rect.left + scrollX ) / scale,
		right: ( rect.right + scrollX ) / scale,
		width: rect.width / scale,
		height: rect.height / scale,
	};
}

const hasSize = ( rect: DOMRect ): boolean => rect.width > 0 && rect.height > 0;

const isSet = ( value: string ): boolean => !! value && value !== 'none';

// Computed colours serialise with an alpha only below 1: `rgba(r, g, b, a)`,
// or `color(space c1 c2 c3 / a)`.
const isTransparent = ( colour: string ): boolean =>
	! colour ||
	colour === 'transparent' ||
	/^rgba\((?:[^,]*,){3}\s*0(?:\.0*)?\s*\)$/.test( colour ) ||
	/\/\s*0(?:\.0*)?\s*\)$/.test( colour );

function paintsBox( style: CSSStyleDeclaration ): boolean {
	return (
		! isTransparent( style.backgroundColor ) ||
		isSet( style.backgroundImage ) ||
		isSet( style.boxShadow ) ||
		[
			style.borderTopWidth,
			style.borderRightWidth,
			style.borderBottomWidth,
			style.borderLeftWidth,
		].some( ( width ) => parseFloat( width ) > 0 )
	);
}

/**
 * How much the canvas is scaled: zoomed-out editing scales it with a
 * transform, which the bounding rect includes and the layout width does not.
 */
const layoutScale = ( element: HTMLElement, rect: DOMRect ): number =>
	element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;

function measure(
	canvasDocument: Document,
	clientId: string,
	findShortId: ( clientId: string ) => string | undefined
): Measured | null {
	const element = canvasDocument.querySelector< HTMLElement >( `[data-block="${ clientId }"]` );
	const rect = element?.getBoundingClientRect();

	if ( ! element || ! rect || ! hasSize( rect ) ) {
		return null;
	}

	const view = canvasDocument.defaultView;
	const scale = layoutScale( element, rect );
	const toCanvasBox = ( boxRect: DOMRect ) =>
		toBox( boxRect, scale, view?.scrollX ?? 0, view?.scrollY ?? 0 );
	const name = getBlock( clientId )?.name ?? 'block';
	const images = Array.from( element.querySelectorAll( 'img' ) );
	// A named image block's image is wherever the editor nests it. Any other
	// block counts as an image only when an image is all it holds.
	const isImageBlock =
		IMAGE_BLOCKS.has( name ) || ( images.length === 1 && ! element.textContent?.trim() );
	const imageRect = isImageBlock
		? images.map( ( image ) => image.getBoundingClientRect() ).find( hasSize )
		: undefined;
	const shortName = name.replace( /^core\//, '' );
	const shortId = findShortId( clientId );

	return {
		clientId,
		label: shortId ? `${ shortName } (${ shortId })` : shortName,
		block: toCanvasBox( rect ),
		isImageBlock,
		...( imageRect && { image: toCanvasBox( imageRect ) } ),
		paints: !! view && paintsBox( view.getComputedStyle( element ) ),
	};
}

/** Measures blocks in the canvas as it is now, each once. `null` where no canvas is mounted. */
function createMeasurer() {
	const canvasDocument = getCanvasDocument();

	if ( ! canvasDocument ) {
		return null;
	}

	const { findShortId } = createShortIdLookup();
	const measured = new Map< string, Measured | null >();
	const visible = new Map< string, Visible >();

	const measureOnce = ( clientId: string ): Measured | null => {
		if ( ! measured.has( clientId ) ) {
			measured.set( clientId, measure( canvasDocument, clientId, findShortId ) );
		}

		return measured.get( clientId ) ?? null;
	};

	// An image block shows its image; a container, what its children show, or
	// its own box as well when it paints one, as a card does; any other block,
	// its own box. A container is as unknown as any child of it.
	const visibleOf = ( clientId: string ): Visible => {
		const known = visible.get( clientId );

		if ( known ) {
			return known;
		}

		visible.set( clientId, 'unknown' );

		const item = measureOnce( clientId );
		let box: Visible;

		if ( ! item ) {
			box = 'hidden';
		} else if ( item.isImageBlock ) {
			box = item.image ?? 'unknown';
		} else {
			const children = getBlocks( clientId ).map( ( child ) => visibleOf( child.clientId ) );

			if ( children.includes( 'unknown' ) ) {
				box = 'unknown';
			} else {
				const childBoxes = children.filter( isBox );

				if ( item.paints ) {
					box = union( [ item.block, ...childBoxes ] );
				} else {
					box = childBoxes.length ? union( childBoxes ) : item.block;
				}
			}
		}

		visible.set( clientId, box );

		return box;
	};

	return { measureOnce, visibleOf, findShortId };
}

// Which side of the centre an offset falls on, or empty within the tolerance.
function side( offset: number, before: string, after: string ): string {
	if ( Math.abs( offset ) <= TOLERANCE ) {
		return '';
	}

	return offset < 0 ? before : after;
}

function describePlacement( outer: Box, inner: Box ): string {
	const dy = centreOf( inner ) - centreOf( outer );
	const dx = ( inner.left + inner.right ) / 2 - ( outer.left + outer.right ) / 2;

	return (
		[ side( dy, 'top', 'bottom' ), side( dx, 'left', 'right' ) ].filter( Boolean ).join( ' ' ) ||
		'centre'
	);
}

/** The image inside a block, when the block is noticeably larger than what it shows. */
function describeImage( item: Measured ): string {
	const { block, image } = item;

	if (
		! image ||
		( block.width - image.width <= TOLERANCE && block.height - image.height <= TOLERANCE )
	) {
		return '';
	}

	return `${ item.label }: block ${ px( block.width ) }×${ px( block.height ) }, image ${ px(
		image.width
	) }×${ px( image.height ) } at the ${ describePlacement( block, image ) } of it.`;
}

/** Whether the items, left to right, sit side by side in one line. */
function isOneRow( items: Measured[] ): boolean {
	return items.every( ( item, index ) => {
		const previous = items[ index - 1 ];

		return (
			! previous ||
			( item.block.left >= previous.block.right - TOLERANCE &&
				item.block.top < previous.block.bottom &&
				previous.block.top < item.block.bottom )
		);
	} );
}

/**
 * The items of one row, their visible top and bottom edges, and how their
 * centre lines compare. Visible, not laid out: a group is as tall as its
 * tallest child's block, which says nothing of where that child's content sits.
 */
function describeRow( { parent, items, boxes }: Row ): string {
	const centres = boxes.map( centreOf );
	const [ reference ] = items;
	const edges = items
		.map(
			( item, index ) =>
				`${ item.label } ${ px( boxes[ index ].top - parent.block.top ) }–${ px(
					boxes[ index ].bottom - parent.block.top
				) }`
		)
		.join( ', ' );
	const spread = Math.max( ...centres ) - Math.min( ...centres );

	const describeOffset = ( item: Measured, index: number ): string => {
		const offset = px( centres[ index ] - centres[ 0 ] );

		if ( Math.abs( offset ) <= TOLERANCE ) {
			return `${ item.label }'s is level with it`;
		}

		return `${ item.label }'s is ${ Math.abs( offset ) }px ${ offset < 0 ? 'above' : 'below' } it`;
	};

	const comparison =
		spread <= TOLERANCE
			? `Their visible centre lines are level (within ${ TOLERANCE }px).`
			: `Their visible centre lines are not level. Against ${ reference.label }'s: ${ items
					.map( describeOffset )
					.slice( 1 )
					.join( '; ' ) }.`;

	return `Row in ${ parent.label }, left to right, visible top–bottom in px from the row's top: ${ edges }. ${ comparison }`;
}

/**
 * Measured boxes in and around the edited blocks: every row found within a few
 * levels below each one, and its siblings where they form a row, with the rows
 * holding an image block first; and every image block anywhere below that
 * fills less of its block than the block's box suggests. A block the canvas
 * does not lay out is skipped, a row with an item whose visible box cannot be
 * read is left out, and a canvas that is not mounted gives nothing. Never
 * throws: the notes ride along with an edit and must not fail it.
 * @param clientIds The edited blocks.
 * @returns Capture notes, one sentence or so each.
 */
export function describeMeasuredLayout( clientIds: string[] ): string[] {
	try {
		return measureLayout( clientIds );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Failed to measure the canvas layout:', error );

		return [];
	}
}

function measureLayout( clientIds: string[] ): string[] {
	const measurer = clientIds.length ? createMeasurer() : null;

	if ( ! measurer ) {
		return [];
	}

	const { measureOnce, visibleOf } = measurer;
	const rowParents: string[] = [];
	const imageBlocks: string[] = [];
	const visited = new Set< string >();

	const walk = ( clientId: string, depth: number ) => {
		if ( visited.has( clientId ) || visited.size >= MAX_VISITED ) {
			return;
		}

		visited.add( clientId );

		const children = getBlocks( clientId );

		if ( ! children.length ) {
			if ( measureOnce( clientId )?.isImageBlock ) {
				imageBlocks.push( clientId );
			}

			return;
		}

		if ( depth <= MAX_ROW_DEPTH ) {
			rowParents.push( clientId );
		}

		children.forEach( ( child ) => walk( child.clientId, depth + 1 ) );
	};

	clientIds.forEach( ( clientId ) => walk( clientId, 0 ) );

	// The row an edited block sits in, for an edit to one of its items.
	clientIds.forEach( ( clientId ) => {
		const parent = getBlockRootClientId( clientId );

		if ( parent && ! rowParents.includes( parent ) ) {
			rowParents.push( parent );
		}
	} );

	const rows = rowParents
		.map( ( parentId ): Row | null => {
			const parent = measureOnce( parentId );
			const children = getBlocks( parentId );

			if ( ! parent || children.length < 2 || children.length > MAX_ROW_ITEMS ) {
				return null;
			}

			const items = children
				.map( ( child ) => measureOnce( child.clientId ) )
				.filter( ( item ): item is Measured => !! item )
				.sort( ( a, b ) => a.block.left - b.block.left );

			if ( items.length < 2 || ! isOneRow( items ) ) {
				return null;
			}

			const boxes = items.map( ( item ) => visibleOf( item.clientId ) );

			if ( ! boxes.every( isBox ) ) {
				return null;
			}

			return {
				parent,
				items,
				boxes,
				holdsImage: items.some(
					( item ) => item.isImageBlock && ! getBlocks( item.clientId ).length
				),
			};
		} )
		.filter( ( row ): row is Row => !! row )
		// Stable: the rows holding an image first, each group in the order found.
		.sort( ( a, b ) => Number( b.holdsImage ) - Number( a.holdsImage ) )
		.slice( 0, MAX_ROWS );

	// Leaf images under the edits first, then those in the rows around them.
	const imageHolders = new Set( [
		...imageBlocks,
		...rows.flatMap( ( row ) =>
			row.items
				.filter( ( item ) => ! getBlocks( item.clientId ).length )
				.map( ( item ) => item.clientId )
		),
	] );

	const images = [ ...imageHolders ]
		.map( ( clientId ) => {
			const item = measureOnce( clientId );

			return item ? describeImage( item ) : '';
		} )
		.filter( Boolean )
		.slice( 0, MAX_IMAGE_NOTES );

	return [ ...images, ...rows.map( describeRow ) ];
}

/** The visible boxes of the edited blocks and their children, read before an edit. */
export interface LayoutSnapshot {
	boxes: Map< string, Box >;
	labels: string[];
}

/**
 * Reads the visible boxes of the edited blocks and their children, for
 * `describeUnmoved()` to compare against after the edit. `null` when any of
 * them cannot be read: a comparison against a partial reading could not
 * claim that nothing moved. Never throws.
 * @param clientIds The blocks the edit is about to change.
 * @returns The reading, or `null`.
 */
export function snapshotLayout( clientIds: string[] ): LayoutSnapshot | null {
	try {
		const measurer = clientIds.length ? createMeasurer() : null;

		if ( ! measurer ) {
			return null;
		}

		const ids = new Set( [
			...clientIds,
			...clientIds.flatMap( ( clientId ) =>
				getBlocks( clientId ).map( ( child ) => child.clientId )
			),
		] );
		const boxes = new Map< string, Box >();

		for ( const clientId of ids ) {
			const box = measurer.visibleOf( clientId );

			if ( box === 'unknown' ) {
				return null;
			}

			if ( isBox( box ) ) {
				boxes.set( clientId, box );
			}
		}

		const labels = clientIds
			.map( ( clientId ) => measurer.measureOnce( clientId )?.label )
			.filter( ( label ): label is string => !! label );

		return boxes.size && labels.length ? { boxes, labels } : null;
	} catch {
		return null;
	}
}

const hasMoved = ( before: Box, after: Box ): boolean =>
	[ 'top', 'left', 'width', 'height' ].some(
		( key ) => Math.abs( before[ key as keyof Box ] - after[ key as keyof Box ] ) > TOLERANCE
	);

/**
 * A note when nothing the edit named moved: an edit that changes settings
 * without changing the page, which a picture of the page looks just as right
 * after as before. Empty when anything moved or cannot be read again, a block
 * replaced by the edit among them. Never throws.
 * @param snapshot The reading from before the edit.
 * @returns The note, or empty.
 */
export function describeUnmoved( snapshot: LayoutSnapshot ): string {
	try {
		const measurer = createMeasurer();

		if ( ! measurer ) {
			return '';
		}

		for ( const [ clientId, before ] of snapshot.boxes ) {
			const after = measurer.visibleOf( clientId );

			if ( ! isBox( after ) || hasMoved( before, after ) ) {
				return '';
			}
		}

		const { labels } = snapshot;
		const children = labels.length === 1 ? 'its children' : 'their children';

		return `No edited block moved: ${ labels.join(
			', '
		) } and ${ children } are where they were before the edit.`;
	} catch {
		return '';
	}
}

const MAX_WIDTH_NOTES = 4;
// The server keeps at most this many.
const MAX_WIDTH_SHORTFALLS = 8;
// As many ids as the edit's other detail lists hold.
const MAX_WIDTH_IDS = 10;
// Larger: a block left off this list reads as not measured.
const MAX_MEASURED_IDS = 50;
// How many elements up from an edited block to look for the box that sets its
// width. Elements, not blocks: a block's children often sit in a wrapper of
// its own, such as a cover's inner container.
const MAX_WIDTH_DEPTH = 12;

interface WidthReading {
	/** The element's laid-out width. */
	width: number;
	/** The width of the content box it sits in: its container's, less padding and borders. */
	available: number;
	containerStyle: CSSStyleDeclaration;
	style: CSSStyleDeclaration;
}

/** An element's width against its container's content box, in canvas CSS pixels. */
function readWidth( element: HTMLElement, container: HTMLElement ): WidthReading | null {
	const view = element.ownerDocument.defaultView;
	const rect = element.getBoundingClientRect();
	const containerRect = container.getBoundingClientRect();

	if ( ! view || ! hasSize( rect ) || ! hasSize( containerRect ) ) {
		return null;
	}

	const scale = layoutScale( element, rect );
	const containerStyle = view.getComputedStyle( container );
	const insets = [
		containerStyle.paddingLeft,
		containerStyle.paddingRight,
		containerStyle.borderLeftWidth,
		containerStyle.borderRightWidth,
	].reduce( ( sum, value ) => sum + ( parseFloat( value ) || 0 ), 0 );

	return {
		width: rect.width / scale,
		available: containerRect.width / scale - insets,
		containerStyle,
		style: view.getComputedStyle( element ),
	};
}

/**
 * Why a container might leave a child narrower than itself, as far as its
 * computed layout says. In a flex column a child is only as wide as its
 * content unless it is stretched; in a flex row, unless it grows.
 */
function describeContainerLayout( container: string, reading: WidthReading ): string {
	const { containerStyle, style } = reading;

	if ( ! [ 'flex', 'inline-flex' ].includes( containerStyle.display ) ) {
		return containerStyle.display.endsWith( 'grid' ) ? `${ container } is a grid` : '';
	}

	if ( containerStyle.flexDirection.startsWith( 'column' ) ) {
		const alignSelf =
			style.alignSelf && style.alignSelf !== 'auto'
				? `, and the narrow box has align-self: ${ style.alignSelf }`
				: '';

		return `${ container } is a flex column with align-items: ${
			containerStyle.alignItems || 'normal'
		}${ alignSelf }`;
	}

	return `${ container } is a flex row, and the narrow box has flex-grow: ${
		style.flexGrow || '0'
	}`;
}

/**
 * A block narrower than its parent's content box, inside a flex column that
 * does not stretch it: the case an automatic correction can fix by
 * stretching the block itself. Short ids, the same the notes use.
 */
export interface WidthShortfall {
	clientId: string;
	width: number;
	parentClientId: string;
	/** The parent's content box, which the block would fill if stretched. */
	parentWidth: number;
	/** The parent's computed `align-items`. */
	alignItems: string;
	/**
	 * The measured blocks whose walk ended at this one, itself included when
	 * it was measured: the server corrects only for blocks the call is about,
	 * and the narrow block is often their ancestor.
	 */
	fromClientIds: string[];
}

/** The width notes for the model to read, and the shortfalls for the server to act on. */
export interface MeasuredWidths {
	notes: string[];
	/**
	 * One per narrow block, which is often not the block edited: an edit to
	 * the items in a list leaves the list as narrow as it was.
	 */
	shortfalls: WidthShortfall[];
	/**
	 * The blocks whose width could be read, so "measured, and no shortfall"
	 * can be told from "not measured".
	 */
	measuredClientIds: string[];
}

/**
 * How wide the edited blocks are, and what sets that width.
 *
 * "Full width" cannot be checked from a picture without something to compare
 * against, and the box that is narrow is often not the block edited: blocks
 * that fill their parent look the same however narrow the parent is. So from
 * each edited block this walks up the elements to the first one narrower than
 * the content box it sits in, and states both widths and that box's layout.
 * Edited blocks narrowed by the same box share a note. A block whose width
 * cannot be read gives no note. Never throws.
 * @param clientIds The edited blocks.
 * @returns Capture notes, one per box that sets a width, and the shortfalls a
 * correction can fix.
 */
export function describeMeasuredWidths( clientIds: string[] ): MeasuredWidths {
	try {
		return measureWidths( clientIds );
	} catch {
		return { notes: [], shortfalls: [], measuredClientIds: [] };
	}
}

function measureWidths( clientIds: string[] ): MeasuredWidths {
	const canvasDocument = clientIds.length ? getCanvasDocument() : null;
	const measurer = canvasDocument ? createMeasurer() : null;

	if ( ! canvasDocument || ! measurer ) {
		return { notes: [], shortfalls: [], measuredClientIds: [] };
	}

	const shortIdOf = ( element: HTMLElement ) => {
		const clientId = element.dataset.block ?? '';

		return measurer.findShortId( clientId ) ?? clientId;
	};
	const measured: HTMLElement[] = [];

	const blockOf = ( element: Element ) => element.closest< HTMLElement >( '[data-block]' );
	const labelOf = ( element: HTMLElement ): string => {
		const block = blockOf( element );

		if ( ! block ) {
			return "the page's content area";
		}

		const label = measurer.measureOnce( block.dataset.block ?? '' )?.label ?? 'a block';

		return block === element ? label : `the inner container of ${ label }`;
	};

	// Keyed by the box that sets the width; a block that fills every box up
	// to the page gets a note of its own.
	const notes = new Map<
		HTMLElement | string,
		{ edited: HTMLElement[]; setter?: HTMLElement; container: HTMLElement; reading: WidthReading }
	>();

	for ( const clientId of clientIds ) {
		const element = canvasDocument.querySelector< HTMLElement >( `[data-block="${ clientId }"]` );
		let current = element;

		for ( let depth = 0; element && current && depth < MAX_WIDTH_DEPTH; depth++ ) {
			const container = current.parentElement;
			const reading = container && readWidth( current, container );

			if ( ! container || ! reading ) {
				break;
			}

			const narrower = reading.available - reading.width > TOLERANCE;

			if ( narrower ) {
				const note = notes.get( current ) ?? { edited: [], setter: current, container, reading };

				note.edited.push( element );
				notes.set( current, note );
				measured.push( element );
				break;
			}

			// Filled every box up to the page: the reading at the top says how
			// wide the page's content area is, the block's own how wide it is.
			if ( ! blockOf( container ) ) {
				const own = element === current ? reading : readWidth( element, current );

				if ( own ) {
					notes.set( clientId, {
						edited: [ element ],
						container,
						reading: { ...own, available: reading.available },
					} );
					measured.push( element );
				}
				break;
			}

			current = container;
		}
	}

	// Held by its own max-width, which a computed style gives in the units it
	// was written in: a percentage is not a width to compare against.
	const isCapped = ( { style, width }: WidthReading ) =>
		style.maxWidth.endsWith( 'px' ) &&
		Math.abs( parseFloat( style.maxWidth ) - width ) <= TOLERANCE;
	// Side margins that take up the rest of the box, auto ones included: a
	// stretch cannot widen a block past them.
	const marginsTakeTheRoom = ( { style, width, available }: WidthReading ) =>
		width + ( parseFloat( style.marginLeft ) || 0 ) + ( parseFloat( style.marginRight ) || 0 ) >=
		available - TOLERANCE;

	// Only for what a stretch can fix: a block, since a wrapper cannot take a
	// class, in a flex column that does not already stretch its children,
	// where nothing of the block's own holds it narrow.
	const idsOf = ( elements: HTMLElement[], max = MAX_WIDTH_IDS ) =>
		[ ...new Set( elements.map( shortIdOf ) ) ].slice( 0, max );
	const shortfalls = [ ...notes.values() ]
		.flatMap( ( { edited, setter, container, reading } ): WidthShortfall[] => {
			const parent = blockOf( container );
			const { display, flexDirection, alignItems } = reading.containerStyle;

			if (
				! setter ||
				blockOf( setter ) !== setter ||
				! parent ||
				! [ 'flex', 'inline-flex' ].includes( display ) ||
				! flexDirection.startsWith( 'column' ) ||
				[ '', 'normal', 'stretch' ].includes( alignItems ) ||
				isCapped( reading ) ||
				marginsTakeTheRoom( reading )
			) {
				return [];
			}

			return [
				{
					clientId: shortIdOf( setter ),
					width: px( reading.width ),
					parentClientId: shortIdOf( parent ),
					parentWidth: px( reading.available ),
					alignItems,
					fromClientIds: idsOf( edited ),
				},
			];
		} )
		.slice( 0, MAX_WIDTH_SHORTFALLS );

	const widthNotes = [ ...notes.values() ]
		.slice( 0, MAX_WIDTH_NOTES )
		.map( ( { edited, setter, container, reading } ) => {
			if ( ! setter ) {
				return `Width: ${ labelOf( edited[ 0 ] ) } is ${ px(
					reading.width
				) }px wide, as wide as the boxes it sits in allow, up to the page's content area (${ px(
					reading.available
				) }px).`;
			}

			const setterLabel = labelOf( setter );
			const containerLabel = labelOf( container );
			const layout = describeContainerLayout( containerLabel, reading );
			const capped = isCapped( reading )
				? ` It is held there by its max-width of ${ px( parseFloat( reading.style.maxWidth ) ) }px.`
				: '';
			const where = `${ px( reading.width ) }px wide inside ${ containerLabel }, whose content box is ${ px(
				reading.available
			) }px wide${ layout ? `; ${ layout }` : '' }.${ capped }`;

			// Edited itself: its own width is the point, and blocks edited inside
			// it are only as wide as it lets them be.
			if ( edited.includes( setter ) ) {
				return `Width: ${ setterLabel } is ${ where }`;
			}

			const [ are, they ] = edited.length === 1 ? [ 'is', 'it sits' ] : [ 'are', 'they sit' ];

			return `Width: ${ edited
				.map( labelOf )
				.join(
					', '
				) } ${ are } as wide as the boxes ${ they } in allow, up to ${ setterLabel }, but ${ setterLabel } is only ${ where }`;
		} );

	return { notes: widthNotes, shortfalls, measuredClientIds: idsOf( measured, MAX_MEASURED_IDS ) };
}
