/**
 * Pointer-based drag-drop for the customize mode.
 *
 * Calypso-side mirror of the public plugin's `customizer/drag-drop.js`
 * (`WordPress/wp-admin-sidebar` v0.1.4). Pointer-down on a reassignable LI
 * starts the drag; a floating ghost follows the cursor; a full-width drop
 * indicator inserts at the slot under the cursor; pointer-up commits the
 * move via the `CustomizeController.commitMove` hook.
 *
 * Identical-behaviour anchors:
 * - Row 17 (ghost matches source dimensions; rect read once at drag start).
 * - Row 18 (full-width drop indicator).
 * - Row 19 (drag-time hover suppression via body class).
 * - Row 27 (slot computation w/ same-container -1 adjustment).
 * - Row 28 (drop on collapsed group header lands at end of group).
 * - ESC cancels drag (mirrors `onKeyDown` in drag-drop.js).
 *
 * Calypso DOM contract (matches what `<MySitesSidebarUnifiedSidebarGroup>`
 * and `<MySitesSidebarUnifiedItem>` render):
 *
 * - Reassignable LI: any `<li>` carrying `data-wp-admin-sidebar-item-id`.
 * Has the class `is-admin-sidebar-reassignable` during customize mode.
 * - Group container LI: `<li class="wp-admin-sidebar-group" data-group="..."
 * data-expanded="...">` — children live in the inner
 * `<ul class="wp-admin-sidebar-group__children">`.
 * - Top-level container: the sidebar `<ul>` itself.
 *
 * Slot computation respects `pointer-events: none` on inert anchors, which
 * is critical: `document.elementsFromPoint` correctly returns the parent LI
 * when the inner anchor is non-interactive (Calypso customize-mode CSS
 * scopes `pointer-events: none` to non-reassignable inner content).
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/drag-drop.js
 */
import { translate } from 'i18n-calypso';
import { layoutIndexOf, layoutRowsForContainer } from './dom-layout';
import { BODY_DRAGGING_CLASS } from './index';
import type { CommitMoveDetails } from './index';
import type { LayoutPosition } from 'calypso/state/admin-sidebar/layout/types';

const GHOST_CLASS = 'admin-sidebar-drag-ghost';
const INDICATOR_CLASS = 'admin-sidebar-drop-indicator';
const SOURCE_DRAGGING_CLASS = 'is-admin-sidebar-source-dragging';
const REASSIGNABLE_SELECTOR = 'li[data-wp-admin-sidebar-item-id]';
const GROUP_SELECTOR = 'li.wp-admin-sidebar-group';
const CALYPSO_ROW_SELECTOR = '.wp-admin-sidebar-group__children > li, .sidebar > li';
// Broad drop-target selector — mirrors the public plugin's
// `li.menu-top, li.wp-admin-sidebar-group`. Any top-level Calypso item
// (`.sidebar__menu-item-parent` for leaf items, bare `<li>` for expandable
// items rendered via `<MySitesSidebarUnifiedMenu>`) is a valid drop
// neighbour even if it's not itself reassignable. `.sidebar > li` and
// `.wp-admin-sidebar-group__children > li` are the catch-alls for expandable
// wrappers that don't carry the `sidebar__menu-item-parent` class.
const DROP_NEIGHBOUR_SELECTOR =
	'li[data-wp-admin-sidebar-item-id], li.sidebar__menu-item-parent, li.wp-admin-sidebar-group, .sidebar > li, .wp-admin-sidebar-group__children > li';

export interface DragDropController {
	commitMove: ( itemId: string, position: LayoutPosition, details?: CommitMoveDetails ) => boolean;
	beginDrag: ( itemId: string, sourcePosition: LayoutPosition ) => void;
	endDrag: () => void;
	announce: ( msg: string ) => void;
}

interface DropTarget {
	container: Element;
	beforeLi: Element | null;
	position: LayoutPosition;
}

interface ActiveDrag {
	itemId: string;
	li: HTMLElement;
	sourcePosition: LayoutPosition;
}

/**
 * Attach drag-drop handlers. Listeners are bound to `document` so the
 * caller doesn't need to thread a sidebar-root ref through the React tree
 * (the body.jsx fragment doesn't have a single root wrapper). Each
 * pointer-down checks whether the event target is inside a reassignable
 * row before doing anything; everything else falls through. Mirrors the
 * public plugin's behaviour where the sidebar root listener acts on its
 * own descendants only.
 *
 * Returns a detach function — call it on customize-mode exit to remove
 * listeners and clean up any in-flight ghost/indicator.
 */
export function attachDragDrop( controller: DragDropController ): () => void {
	let activeItem: ActiveDrag | null = null;
	let ghost: HTMLDivElement | null = null;
	let indicator: HTMLLIElement | null = null;
	let pointerOffset = { x: 0, y: 0 };
	let lastTarget: DropTarget | null = null;

	function onPointerDown( ev: PointerEvent ) {
		const target = ev.target instanceof Element ? ev.target : null;
		if ( ! target ) {
			return;
		}
		// Whole-row drag target except the more-options button (Phase 2 row 27,
		// Figma 3505:75220). The more-options trigger has its own click handler.
		if ( target.closest( '.admin-sidebar-item__more' ) ) {
			return;
		}
		const li = target.closest( REASSIGNABLE_SELECTOR ) as HTMLElement | null;
		if ( ! li ) {
			return;
		}
		ev.preventDefault();
		const itemId = li.getAttribute( 'data-wp-admin-sidebar-item-id' );
		if ( ! itemId ) {
			return;
		}

		// Defensive cleanup if a prior drag didn't finalise (lost pointerup,
		// page error). Without this the previous ghost stays on screen.
		if ( activeItem || ghost ) {
			cleanup();
		}

		const rect = li.getBoundingClientRect(); // Read once (Phase 2 row 17).
		pointerOffset = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };

		const sourcePosition = positionForElement( li );
		activeItem = { itemId, li, sourcePosition };
		li.classList.add( SOURCE_DRAGGING_CLASS );
		document.body.classList.add( BODY_DRAGGING_CLASS );
		ghost = createGhost( li, rect );
		document.body.appendChild( ghost );
		moveGhost( ev.clientX, ev.clientY );
		controller.beginDrag( itemId, sourcePosition );

		document.addEventListener( 'pointermove', onPointerMove );
		document.addEventListener( 'pointerup', onPointerUp );
		document.addEventListener( 'keydown', onKeyDown );
	}

	function onPointerMove( ev: PointerEvent ) {
		if ( ! activeItem ) {
			return;
		}
		moveGhost( ev.clientX, ev.clientY );
		const target = findDropTarget( ev.clientX, ev.clientY );
		updateIndicator( target );
		lastTarget = target;
	}

	function onPointerUp() {
		if ( ! activeItem ) {
			return;
		}
		if ( lastTarget && lastTarget.position && lastTarget.container ) {
			const label = labelForElement( activeItem.li, activeItem.itemId );
			const moved = controller.commitMove( activeItem.itemId, lastTarget.position, {
				previousPosition: activeItem.sourcePosition,
				label,
			} );
			if ( moved ) {
				const indexLabel = lastTarget.position.index + 1;
				controller.announce(
					translate( 'Moved %(label)s to position %(index)d.', {
						args: {
							label,
							index: indexLabel,
						},
					} ) as string
				);
			}
		}
		cleanup();
	}

	function onKeyDown( ev: KeyboardEvent ) {
		if ( ev.key === 'Escape' && activeItem ) {
			cleanup();
		}
	}

	function cleanup() {
		if ( activeItem ) {
			activeItem.li.classList.remove( SOURCE_DRAGGING_CLASS );
			activeItem = null;
		}
		document.body.classList.remove( BODY_DRAGGING_CLASS );
		if ( ghost && ghost.parentNode ) {
			ghost.parentNode.removeChild( ghost );
		}
		ghost = null;
		removeIndicator();
		lastTarget = null;
		document.removeEventListener( 'pointermove', onPointerMove );
		document.removeEventListener( 'pointerup', onPointerUp );
		document.removeEventListener( 'keydown', onKeyDown );
		controller.endDrag();
	}

	function moveGhost( x: number, y: number ) {
		if ( ! ghost ) {
			return;
		}
		ghost.style.transform = `translate(${ x - pointerOffset.x }px, ${ y - pointerOffset.y }px)`;
	}

	function findDropTarget( x: number, y: number ): DropTarget | null {
		// `elementsFromPoint` walks the stack so we can pierce overlay/ghost
		// elements and find the actual sidebar row beneath the cursor.
		const elements = document.elementsFromPoint( x, y );
		for ( const el of elements ) {
			const li = findDropNeighbour( el );
			if ( ! li || li === activeItem?.li ) {
				continue;
			}

			// Drop on a group header → land in that group's children list
			// (Phase 2 row 28). Three cases:
			//   1. Collapsed group: drop at end of children.
			//   2. Expanded but EMPTY group: drop at index 0 of children.
			//      Without this branch, an emptied "My Plugins" group has no
			//      reassignable children and the group header is the only
			//      hit-target — without it the user can never re-add items.
			//   3. Expanded group with children: keep walking. The children
			//      below will surface as drop neighbours on their own so the
			//      indicator can paint between specific rows.
			if ( li.classList.contains( 'wp-admin-sidebar-group' ) ) {
				const childList = li.querySelector( ':scope > .wp-admin-sidebar-group__children' );
				const groupId = li.getAttribute( 'data-group' );
				if ( ! childList || ! groupId ) {
					continue;
				}
				const isExpanded = li.getAttribute( 'data-expanded' ) === 'true';
				const isEmpty = childList.querySelectorAll( ':scope > li' ).length === 0;
				if ( ! isExpanded || isEmpty ) {
					const slot = layoutRowsForContainer( childList ).length;
					return {
						container: childList,
						beforeLi: null,
						position: {
							kind: 'in_group',
							group_id: groupId,
							index: slot,
						},
					};
				}
				continue;
			}

			// Any top-level sibling row (reassignable or not) — use vertical
			// midpoint to decide above-or-below.
			const rect = li.getBoundingClientRect();
			const above = y < rect.top + rect.height / 2;
			const container = li.parentElement;
			if ( ! container ) {
				continue;
			}
			const enclosingGroup = container.closest( GROUP_SELECTOR );
			const baseIndex = layoutIndexOf( container, li );
			if ( baseIndex === -1 ) {
				continue;
			}
			let slot = above ? baseIndex : baseIndex + 1;
			// Same-container -1 adjustment (Phase 2 row 27). When the source
			// is in the same container at a lower index, dropping it later
			// requires `-1` because removing the source shifts everything
			// past its position up by one slot.
			if ( activeItem?.li.parentElement === container ) {
				const sourceIndex = layoutIndexOf( container, activeItem.li );
				if ( sourceIndex !== -1 && sourceIndex < slot ) {
					slot -= 1;
				}
			}
			if ( enclosingGroup ) {
				const groupId = enclosingGroup.getAttribute( 'data-group' );
				if ( groupId ) {
					return {
						container,
						beforeLi: above ? li : li.nextElementSibling,
						position: { kind: 'in_group', group_id: groupId, index: slot },
					};
				}
			}
			return {
				container,
				beforeLi: above ? li : li.nextElementSibling,
				position: { kind: 'top_level', index: slot },
			};
		}
		return null;
	}

	function updateIndicator( target: DropTarget | null ) {
		if ( ! target ) {
			removeIndicator();
			return;
		}
		if ( ! indicator ) {
			indicator = document.createElement( 'li' );
			indicator.className = INDICATOR_CLASS;
			indicator.setAttribute( 'aria-hidden', 'true' );
		}
		const expectedNext = target.beforeLi || null;
		if (
			indicator.parentElement === target.container &&
			indicator.nextElementSibling === expectedNext
		) {
			return;
		}
		target.container.insertBefore( indicator, expectedNext );
	}

	function removeIndicator() {
		if ( indicator && indicator.parentNode ) {
			indicator.parentNode.removeChild( indicator );
		}
		indicator = null;
	}

	document.addEventListener( 'pointerdown', onPointerDown );
	return function detach() {
		document.removeEventListener( 'pointerdown', onPointerDown );
		cleanup();
	};
}

function findDropNeighbour( el: Element ): Element | null {
	// Expandable Calypso rows contain an inner `<li>` inside
	// `.sidebar__menu.is-togglable`. Hit-testing can land on that inner LI;
	// slot math must use the real rendered sidebar row instead.
	return el.closest( CALYPSO_ROW_SELECTOR ) || el.closest( DROP_NEIGHBOUR_SELECTOR );
}

/**
 * Build the floating ghost from the source LI. Width/height match the
 * source row (Phase 2 row 17). The ghost is a shallow clone of the link
 * inside the row so it carries the icon/label without needing a full
 * structural copy.
 */
function createGhost( li: HTMLElement, rect: DOMRect ): HTMLDivElement {
	const ghost = document.createElement( 'div' );
	ghost.className = GHOST_CLASS;
	ghost.style.width = `${ rect.width }px`;
	ghost.style.height = `${ rect.height }px`;

	const link = li.querySelector( ':scope > a, :scope a' );
	if ( link ) {
		const cloned = link.cloneNode( true ) as HTMLElement;
		cloned.removeAttribute( 'id' );
		cloned.removeAttribute( 'href' );
		cloned.setAttribute( 'aria-hidden', 'true' );
		cloned.setAttribute( 'tabindex', '-1' );
		cloned
			.querySelectorAll( '.admin-sidebar-item__more, .wp-submenu, .wp-submenu-wrap' )
			.forEach( ( el ) => el.remove() );
		ghost.appendChild( cloned );
	} else {
		ghost.textContent = ( li.textContent || '' ).trim();
	}
	return ghost;
}

/**
 * Compute the canonical Position for a sidebar item from its DOM placement.
 * Used to seed sourcePosition on drag start.
 */
export function positionForElement( li: HTMLElement ): LayoutPosition {
	const groupContainer = li.parentElement ? li.parentElement.closest( GROUP_SELECTOR ) : null;
	const siblings = li.parentElement ? Math.max( 0, layoutIndexOf( li.parentElement, li ) ) : 0;
	if ( groupContainer ) {
		return {
			kind: 'in_group',
			group_id: groupContainer.getAttribute( 'data-group' ) || '',
			index: siblings,
		};
	}
	return { kind: 'top_level', index: siblings };
}

export function labelForElement( li: HTMLElement, fallback: string ): string {
	const link = li.querySelector( ':scope > a, :scope a' );
	if ( ! link ) {
		return ( li.textContent || fallback ).trim();
	}
	const cloned = link.cloneNode( true ) as HTMLElement;
	cloned
		.querySelectorAll(
			'.admin-sidebar-item__grip, .admin-sidebar-item__more, .wp-submenu, .wp-submenu-wrap'
		)
		.forEach( ( el ) => el.remove() );
	return ( cloned.textContent || fallback ).trim();
}
