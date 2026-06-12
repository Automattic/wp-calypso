/**
 * Element inspector for annotate mode. Listens on the viewer container in
 * the capture phase and uses `composedPath()` to reach elements inside the
 * open `ShadowPage` roots.
 * Hovering reports the element under the cursor; clicking picks it. All
 * geometry is returned as fractions of the page frame so overlays keep
 * tracking the page through responsive rescaling.
 */
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const FRAME_WRAP_CLASS = 'a4a-one-pager-viewer__iframe-wrap';

export interface AnnotationRect {
	/** Fractions (0–1) of the page frame. */
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface AnnotationTarget {
	/** 1-based page number, cover included. Never the cover (page 1). */
	pageNumber: number;
	tag: string;
	selector: string;
	nearbyText: string;
	rect: AnnotationRect;
}

/**
 * Builds a short CSS selector for an element inside a page shadow root.
 * Walks up at most six levels; the walk stops naturally at the shadow
 * boundary, where `parentElement` is null.
 */
export function buildAnnotationSelector( element: HTMLElement ): string {
	const parts: string[] = [];
	let current: HTMLElement | null = element;
	for ( let depth = 0; depth < 6 && current; depth += 1 ) {
		if ( current.id ) {
			parts.unshift( `#${ CSS.escape( current.id ) }` );
			break;
		}
		let part = current.tagName.toLowerCase();
		const classes = Array.from( current.classList ).slice( 0, 3 );
		if ( classes.length > 0 ) {
			part += `.${ classes.map( ( name ) => CSS.escape( name ) ).join( '.' ) }`;
		}
		const parent: HTMLElement | null = current.parentElement;
		if ( parent ) {
			const tag = current.tagName;
			const siblings = Array.from( parent.children ).filter(
				( sibling ) => sibling.tagName === tag
			);
			if ( siblings.length > 1 ) {
				part += `:nth-of-type(${ siblings.indexOf( current ) + 1 })`;
			}
		}
		parts.unshift( part );
		current = parent;
	}
	return parts.join( ' > ' );
}

const NEARBY_TEXT_MAX_LENGTH = 120;

/** Collapsed text content of the element, capped for prompt size. */
export function getNearbyText( element: HTMLElement ): string {
	// Pre-cap the raw text so hovering a page-sized element doesn't collapse
	// the whole page's text to keep 120 characters of it.
	const collapsed = ( element.textContent || '' ).slice( 0, 1000 ).trim().replace( /\s+/g, ' ' );
	return collapsed.length <= NEARBY_TEXT_MAX_LENGTH
		? collapsed
		: `${ collapsed.slice( 0, NEARBY_TEXT_MAX_LENGTH - 1 ) }…`;
}

const clamp01 = ( value: number ): number => Math.min( 1, Math.max( 0, value ) );

interface ResolvedTarget {
	element: HTMLElement;
	page: HTMLElement;
}

/**
 * Resolves an event into an inspectable element inside a body page's shadow
 * root, or null. Only elements inside a page shadow root are inspectable, so
 * light-DOM viewer chrome and the annotate overlays are excluded by
 * construction. Pages are recognized by the `data-a4a-page-number` /
 * `data-a4a-page-role` contract `PdfViewer` stamps on each page wrapper.
 */
const resolveTarget = ( event: Event ): ResolvedTarget | null => {
	const path = event.composedPath();
	let element: HTMLElement | null = null;
	for ( const node of path ) {
		if ( ! ( node instanceof HTMLElement ) ) {
			continue;
		}
		// The deepest element inside a shadow root is the annotation target.
		if ( ! element && node.getRootNode() instanceof ShadowRoot ) {
			element = node;
		}
		if ( node.dataset.a4aPageNumber ) {
			return element && node.dataset.a4aPageRole !== 'cover' ? { element, page: node } : null;
		}
	}
	return null;
};

const buildTarget = ( resolved: ResolvedTarget ): AnnotationTarget | null => {
	const frame = resolved.page.querySelector< HTMLElement >( `.${ FRAME_WRAP_CLASS }` );
	if ( ! frame ) {
		return null;
	}
	const frameRect = frame.getBoundingClientRect();
	const targetRect = resolved.element.getBoundingClientRect();
	return {
		pageNumber: Number( resolved.page.dataset.a4aPageNumber ),
		tag: resolved.element.tagName.toLowerCase(),
		selector: buildAnnotationSelector( resolved.element ),
		nearbyText: getNearbyText( resolved.element ),
		rect: {
			x: clamp01( ( targetRect.left - frameRect.left ) / frameRect.width ),
			y: clamp01( ( targetRect.top - frameRect.top ) / frameRect.height ),
			width: clamp01( targetRect.width / frameRect.width ),
			height: clamp01( targetRect.height / frameRect.height ),
		},
	};
};

/**
 * Attaches inspect listeners to `containerRef` while `enabled`. Returns the
 * hovered target (for the highlight overlay); calls `onPick` on click.
 */
export function useAnnotationInspector(
	containerRef: RefObject< HTMLElement | null >,
	enabled: boolean,
	onPick: ( target: AnnotationTarget ) => void
): AnnotationTarget | null {
	const [ hovered, setHovered ] = useState< AnnotationTarget | null >( null );
	// Skip re-deriving the hover payload while the cursor stays on one element.
	const hoveredElementRef = useRef< HTMLElement | null >( null );
	const onPickRef = useRef( onPick );
	onPickRef.current = onPick;

	useEffect( () => {
		const container = containerRef.current;
		if ( ! enabled || ! container ) {
			return;
		}

		const clearHover = () => {
			hoveredElementRef.current = null;
			setHovered( null );
		};

		const handleMouseMove = ( event: MouseEvent ) => {
			const resolved = resolveTarget( event );
			if ( ! resolved ) {
				if ( hoveredElementRef.current ) {
					clearHover();
				}
				return;
			}
			if ( resolved.element === hoveredElementRef.current ) {
				return;
			}
			const target = buildTarget( resolved );
			if ( ! target ) {
				clearHover();
				return;
			}
			hoveredElementRef.current = resolved.element;
			setHovered( target );
		};

		const handleClick = ( event: MouseEvent ) => {
			const resolved = resolveTarget( event );
			const target = resolved && buildTarget( resolved );
			if ( ! target ) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			onPickRef.current( target );
		};

		container.addEventListener( 'mousemove', handleMouseMove, true );
		// Non-capture: `mouseleave` doesn't bubble, so this fires only when
		// the cursor leaves the container itself, not its descendants.
		container.addEventListener( 'mouseleave', clearHover );
		container.addEventListener( 'click', handleClick, true );
		return () => {
			container.removeEventListener( 'mousemove', handleMouseMove, true );
			container.removeEventListener( 'mouseleave', clearHover );
			container.removeEventListener( 'click', handleClick, true );
			clearHover();
		};
	}, [ containerRef, enabled ] );

	return hovered;
}
