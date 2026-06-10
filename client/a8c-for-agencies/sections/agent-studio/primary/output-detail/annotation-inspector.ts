/**
 * Element inspector for annotate mode, modeled on Studio Code's `/annotate`
 * inspector. Listens on the viewer container in the capture phase and uses
 * `composedPath()` to reach elements inside the open `ShadowPage` roots.
 * Hovering reports the element under the cursor; clicking picks it. All
 * geometry is returned as fractions of the page frame so overlays keep
 * tracking the page through responsive rescaling.
 */
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const PAGE_CLASS = 'a4a-one-pager-viewer__page';
const FRAME_WRAP_CLASS = 'a4a-one-pager-viewer__iframe-wrap';
const COVER_CLASS = 'is-cover';
// Our own overlay elements (pins, hover box, comment form) are never
// inspectable targets.
const OVERLAY_CLASS_PREFIX = 'a4a-annotation';

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

const cssEscape = ( value: string ): string =>
	typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
		? CSS.escape( value )
		: value.replace( /[^a-zA-Z0-9_-]/g, ( character ) => `\\${ character }` );

/**
 * Builds a short CSS selector for an element inside a page shadow root.
 * Walks up at most six levels; the walk stops naturally at the shadow
 * boundary, where `parentElement` is null.
 */
export function buildAnnotationSelector( element: HTMLElement ): string {
	if ( element.id ) {
		return `#${ cssEscape( element.id ) }`;
	}
	const parts: string[] = [];
	let current: HTMLElement | null = element;
	for ( let depth = 0; depth < 6 && current; depth += 1 ) {
		if ( current.id ) {
			parts.unshift( `#${ cssEscape( current.id ) }` );
			break;
		}
		let part = current.tagName.toLowerCase();
		const classes = Array.from( current.classList ).slice( 0, 3 );
		if ( classes.length > 0 ) {
			part += `.${ classes.map( cssEscape ).join( '.' ) }`;
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

/** Collapsed text content of the element, capped for prompt size. */
export function getNearbyText( element: HTMLElement ): string {
	return ( element.textContent || '' ).trim().replace( /\s+/g, ' ' ).slice( 0, 200 );
}

const clamp01 = ( value: number ): number => Math.min( 1, Math.max( 0, value ) );

interface ResolvedTarget {
	element: HTMLElement;
	page: HTMLElement;
	frame: HTMLElement;
}

/**
 * Resolves an event into an inspectable element inside a body page's shadow
 * root, or null (cover page, viewer chrome, our own overlays, outside pages).
 */
const resolveTarget = ( event: Event, container: HTMLElement ): ResolvedTarget | null => {
	const path = event.composedPath();
	let element: HTMLElement | null = null;
	let page: HTMLElement | null = null;
	for ( const node of path ) {
		if ( ! ( node instanceof HTMLElement ) ) {
			continue;
		}
		const classList = node.classList;
		if ( Array.from( classList ).some( ( name ) => name.startsWith( OVERLAY_CLASS_PREFIX ) ) ) {
			return null;
		}
		// The deepest element inside a shadow root is the annotation target;
		// light-DOM viewer chrome (buttons, frame) is not.
		if ( ! element && node.getRootNode() instanceof ShadowRoot ) {
			element = node;
		}
		if ( classList.contains( PAGE_CLASS ) ) {
			page = node;
			break;
		}
	}
	if ( ! element || ! page || page.classList.contains( COVER_CLASS ) ) {
		return null;
	}
	const frame = page.querySelector< HTMLElement >( `.${ FRAME_WRAP_CLASS }` );
	if ( ! frame || ! container.contains( page ) ) {
		return null;
	}
	return { element, page, frame };
};

const buildTarget = ( resolved: ResolvedTarget, container: HTMLElement ): AnnotationTarget => {
	const pages = Array.from( container.querySelectorAll( `.${ PAGE_CLASS }` ) );
	const pageNumber = pages.indexOf( resolved.page ) + 1;
	const frameRect = resolved.frame.getBoundingClientRect();
	const targetRect = resolved.element.getBoundingClientRect();
	return {
		pageNumber,
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
			const resolved = resolveTarget( event, container );
			if ( ! resolved ) {
				if ( hoveredElementRef.current ) {
					clearHover();
				}
				return;
			}
			if ( resolved.element === hoveredElementRef.current ) {
				return;
			}
			hoveredElementRef.current = resolved.element;
			setHovered( buildTarget( resolved, container ) );
		};

		const handleClick = ( event: MouseEvent ) => {
			const resolved = resolveTarget( event, container );
			if ( ! resolved ) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			onPickRef.current( buildTarget( resolved, container ) );
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
