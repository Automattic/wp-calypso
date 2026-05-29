/**
 * Within-container keyboard reorder for customize mode.
 *
 * Calypso-side mirror of the public plugin's
 * `customizer/keyboard-reorder.js` v0.1.4. ArrowUp / ArrowDown on a
 * focused grip (the row's drag handle) swaps the focused row with its
 * neighbour inside the current container. Cross-container moves are out
 * of scope for v1 keyboard support; the move-menu (deferred to a future
 * PR per § 6 of `a3-planning.md`) covers that path.
 *
 * Identical-behaviour anchor: Phase 2 row 27 (a11y polish — keyboard
 * reorder + live regions).
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/keyboard-reorder.js
 */
import { translate } from 'i18n-calypso';
import { layoutIndexOf, layoutRowsForContainer } from './dom-layout';
import { labelForElement, positionForElement, type DragDropController } from './drag-drop';

const REASSIGNABLE_SELECTOR = 'li[data-wp-admin-sidebar-item-id]';
const GRIP_SELECTOR = '.admin-sidebar-item__grip';
const GROUP_SELECTOR = 'li.wp-admin-sidebar-group';

export function attachKeyboardReorder( controller: DragDropController ): () => void {
	function onKeyDown( ev: KeyboardEvent ) {
		if ( ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown' ) {
			return;
		}
		const target = ev.target instanceof Element ? ev.target : null;
		if ( ! target ) {
			return;
		}
		const grip = target.closest( GRIP_SELECTOR );
		if ( ! grip ) {
			return;
		}
		const li = grip.closest( REASSIGNABLE_SELECTOR ) as HTMLElement | null;
		const container = li?.parentElement;
		if ( ! li || ! container ) {
			return;
		}
		ev.preventDefault();

		const direction = ev.key === 'ArrowUp' ? -1 : 1;
		const siblings = layoutRowsForContainer( container ) as HTMLElement[];
		const current = siblings.indexOf( li );
		let target_idx = current + direction;
		if ( target_idx < 0 || target_idx >= siblings.length ) {
			return; // Boundary; ignore.
		}

		// Skip non-reassignable neighbours (e.g., separators) — walk in the
		// chosen direction until we find one we can swap into.
		while ( target_idx >= 0 && target_idx < siblings.length ) {
			if ( siblings[ target_idx ].matches( REASSIGNABLE_SELECTOR ) ) {
				break;
			}
			target_idx += direction;
		}
		if ( target_idx < 0 || target_idx >= siblings.length ) {
			return;
		}

		const itemId = li.getAttribute( 'data-wp-admin-sidebar-item-id' );
		if ( ! itemId ) {
			return;
		}
		const sourcePosition = positionForElement( li );

		const enclosingGroup = container.closest( GROUP_SELECTOR );
		const groupId = enclosingGroup ? enclosingGroup.getAttribute( 'data-group' ) : null;
		const targetIndex = Math.max( 0, layoutIndexOf( container, siblings[ target_idx ] ) );
		const position = groupId
			? { kind: 'in_group' as const, group_id: groupId, index: targetIndex }
			: { kind: 'top_level' as const, index: targetIndex };

		const total = siblings.length;
		const label = labelForElement( li, itemId );
		if ( controller.commitMove( itemId, position, { previousPosition: sourcePosition, label } ) ) {
			controller.announce(
				translate( 'Moved %(label)s to position %(index)d of %(total)d.', {
					args: {
						label,
						index: target_idx + 1,
						total,
					},
				} ) as string
			);
		}
	}

	document.addEventListener( 'keydown', onKeyDown );
	return function detach() {
		document.removeEventListener( 'keydown', onKeyDown );
	};
}
