/**
 * Move-to menu — the per-item 3-dot popover.
 *
 * Calypso-side mirror of the public plugin's `move-menu.js`
 * (`WordPress/wp-admin-sidebar` v0.1.6 `src/customizer/move-menu.js`).
 *
 * Renders a popup with "Move up / Move down / Move to top level" (when the
 * row is inside a group) and "Reset to default" for the row whose 3-dot
 * trigger was clicked. Commits via the customize controller; the working
 * delta is the source of truth.
 *
 * Identical-behaviour anchors:
 * - Position relative to trigger with flip + clamp into viewport (plugin
 * `positionMenuRelativeTo`).
 * - Close on click-outside, scroll, resize, ESC (plugin's matching handlers).
 * - Move up / Move down advance by exactly one visible row.
 * - Reset to default snaps the row back to its schema-provided baseline.
 * @see WordPress/wp-admin-sidebar v0.1.6 src/customizer/move-menu.js
 */

import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { layoutIndexOf, layoutRowsForContainer } from './dom-layout';
import { useCustomizeContext } from './index';
import type { LayoutPosition } from 'calypso/state/admin-sidebar/layout/types';

interface MoveMenuProps {
	itemId: string;
	itemLabel: string;
	triggerEl: HTMLElement | null;
	onClose: () => void;
}

interface MenuChoice {
	label: string;
	action: () => void;
}

export const MoveMenu = ( { itemId, itemLabel, triggerEl, onClose }: MoveMenuProps ) => {
	const customizeCtx = useCustomizeContext();
	const menuRef = useRef< HTMLUListElement >( null );
	const [ position, setPosition ] = useState< { top: number; left: number } | null >( null );
	const isInGroup = getMoveDestinations( itemId ).isInGroup;

	// Compute one-step move directions from the rendered DOM so the menu
	// crosses group / top-level boundaries naturally (matches plugin's
	// `collectRows` semantics). The committed working delta drives the
	// subsequent React render.
	const moveByDirection = useCallback(
		( direction: -1 | 1 ) => {
			const li = document.querySelector( itemSelector( itemId ) ) as HTMLLIElement | null;
			if ( ! li || ! customizeCtx ) {
				return;
			}
			const rows = collectRows( li );
			const idx = rows.indexOf( li );
			const targetIdx = idx + direction;
			if ( idx === -1 || targetIdx < 0 || targetIdx >= rows.length ) {
				return;
			}
			const target = rows[ targetIdx ];
			const nextPosition = positionForMoveTarget( li, target, direction );
			if ( ! nextPosition ) {
				return;
			}
			customizeCtx.commitMove( itemId, nextPosition );
			customizeCtx.announce(
				translate( 'Moved %(label)s to position %(index)d of %(total)d.', {
					args: {
						label: itemLabel,
						index: targetIdx + 1,
						total: rows.length,
					},
				} ) as string
			);
		},
		[ itemId, itemLabel, customizeCtx ]
	);

	const resetToDefault = useCallback( () => {
		if ( ! customizeCtx ) {
			return;
		}
		customizeCtx.resetItem( itemId );
		customizeCtx.announce(
			translate( 'Reset %(label)s to default position.', {
				args: { label: itemLabel },
			} ) as string
		);
	}, [ itemId, itemLabel, customizeCtx ] );

	const moveToTopLevel = useCallback( () => {
		if ( ! customizeCtx ) {
			return;
		}
		customizeCtx.commitMove( itemId, { kind: 'top_level', index: 0 } );
		customizeCtx.announce(
			translate( 'Moved %(label)s to top level.', {
				args: { label: itemLabel },
			} ) as string
		);
	}, [ itemId, itemLabel, customizeCtx ] );

	const choices: MenuChoice[] = [
		{ label: translate( 'Move up' ) as string, action: () => moveByDirection( -1 ) },
		{ label: translate( 'Move down' ) as string, action: () => moveByDirection( 1 ) },
		...( isInGroup
			? [ { label: translate( 'Move to top level' ) as string, action: moveToTopLevel } ]
			: [] ),
		{ label: translate( 'Reset to default' ) as string, action: resetToDefault },
	];

	// Position relative to trigger after first mount so we can measure the
	// menu's natural size. Mirrors the plugin's `positionMenuRelativeTo`.
	useLayoutEffect( () => {
		if ( ! triggerEl || ! menuRef.current ) {
			return;
		}
		const triggerRect = triggerEl.getBoundingClientRect();
		const menuRect = menuRef.current.getBoundingClientRect();
		const viewportH = window.innerHeight;
		const viewportW = window.innerWidth;
		const margin = 4;
		const spaceBelow = viewportH - triggerRect.bottom - margin;
		const spaceAbove = triggerRect.top - margin;

		let top: number;
		if ( menuRect.height <= spaceBelow ) {
			top = triggerRect.bottom + margin;
		} else if ( menuRect.height <= spaceAbove ) {
			top = triggerRect.top - menuRect.height - margin;
		} else if ( spaceBelow >= spaceAbove ) {
			top = triggerRect.bottom + margin;
		} else {
			top = Math.max( margin, triggerRect.top - menuRect.height - margin );
		}

		let left = triggerRect.left;
		const overflowRight = left + menuRect.width - ( viewportW - margin );
		if ( overflowRight > 0 ) {
			left = Math.max( margin, left - overflowRight );
		}
		setPosition( { top: Math.round( top ), left: Math.round( left ) } );
	}, [ triggerEl ] );

	// Close on click-outside, scroll, resize, ESC.
	useEffect( () => {
		const handlePointerDown = ( ev: PointerEvent ) => {
			const target = ev.target instanceof Element ? ev.target : null;
			if ( ! target ) {
				return;
			}
			if ( menuRef.current?.contains( target ) ) {
				return;
			}
			if ( triggerEl?.contains( target ) ) {
				return;
			}
			onClose();
		};
		const handleClickAway = ( ev: MouseEvent ) => {
			const target = ev.target instanceof Element ? ev.target : null;
			if ( ! target ) {
				return;
			}
			if ( menuRef.current?.contains( target ) ) {
				return;
			}
			if ( triggerEl?.contains( target ) ) {
				return;
			}
			onClose();
		};
		const handleKey = ( ev: KeyboardEvent ) => {
			if ( ev.key === 'Escape' ) {
				onClose();
				triggerEl?.focus();
			}
		};
		const handleScrollResize = () => onClose();
		// Bind on the next tick so the click that opened us doesn't immediately close us.
		const timer = window.setTimeout( () => {
			document.addEventListener( 'click', handleClickAway, true );
		}, 0 );
		document.addEventListener( 'pointerdown', handlePointerDown, true );
		document.addEventListener( 'keydown', handleKey );
		window.addEventListener( 'scroll', handleScrollResize, { passive: true } );
		window.addEventListener( 'resize', handleScrollResize, { passive: true } );
		return () => {
			window.clearTimeout( timer );
			document.removeEventListener( 'pointerdown', handlePointerDown, true );
			document.removeEventListener( 'click', handleClickAway, true );
			document.removeEventListener( 'keydown', handleKey );
			window.removeEventListener( 'scroll', handleScrollResize );
			window.removeEventListener( 'resize', handleScrollResize );
		};
	}, [ triggerEl, onClose ] );

	// Render into document.body so the popup escapes any overflow:hidden
	// containers in the sidebar tree.
	if ( typeof document === 'undefined' ) {
		return null;
	}

	return createPortal(
		<ul
			ref={ menuRef }
			className="admin-sidebar-move-menu"
			role="menu"
			style={ {
				position: 'fixed',
				top: position ? `${ position.top }px` : '0',
				left: position ? `${ position.left }px` : '0',
				visibility: position ? 'visible' : 'hidden',
			} }
		>
			{ choices.map( ( choice ) => (
				<li key={ choice.label }>
					<button
						type="button"
						role="menuitem"
						className="admin-sidebar-move-menu__item"
						onClick={ () => {
							choice.action();
							onClose();
							triggerEl?.focus();
						} }
					>
						{ choice.label }
					</button>
				</li>
			) ) }
		</ul>,
		document.body
	);
};

function escapeSelectorValue( value: string ): string {
	if ( typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ) {
		return CSS.escape( value );
	}
	return value.replace( /["\\]/g, '\\$&' );
}

function itemSelector( itemId: string ): string {
	return `li[data-wp-admin-sidebar-item-id="${ escapeSelectorValue( itemId ) }"]`;
}

function getMoveDestinations( itemId: string ): {
	isInGroup: boolean;
} {
	if ( typeof document === 'undefined' ) {
		return { isInGroup: false };
	}
	const li = document.querySelector( itemSelector( itemId ) ) as HTMLElement | null;
	const currentGroupId = li
		? li.parentElement?.closest( 'li.wp-admin-sidebar-group' )?.getAttribute( 'data-group' ) ?? null
		: null;
	return { isInGroup: currentGroupId !== null };
}

function positionForMoveTarget(
	source: HTMLElement,
	target: HTMLLIElement,
	direction: -1 | 1
): LayoutPosition | null {
	if ( target.classList.contains( 'wp-admin-sidebar-group' ) ) {
		const groupId = target.getAttribute( 'data-group' );
		if ( ! groupId ) {
			return null;
		}
		if ( direction > 0 ) {
			return { kind: 'in_group', group_id: groupId, index: 0 };
		}
		const parent = target.parentElement;
		if ( ! parent ) {
			return null;
		}
		return {
			kind: 'top_level',
			index: layoutRowsForContainer( parent ).length,
		};
	}

	const container = target.parentElement;
	if ( ! container ) {
		return null;
	}
	const targetIndex = layoutIndexOf( container, target );
	if ( targetIndex === -1 ) {
		return null;
	}
	let slot = direction > 0 ? targetIndex + 1 : targetIndex;
	if ( source.parentElement === container ) {
		const sourceIndex = layoutIndexOf( container, source );
		if ( sourceIndex !== -1 && sourceIndex < slot ) {
			slot -= 1;
		}
	}

	const enclosingGroup = container.closest( 'li.wp-admin-sidebar-group' );
	if ( enclosingGroup ) {
		const groupId = enclosingGroup.getAttribute( 'data-group' );
		return groupId ? { kind: 'in_group', group_id: groupId, index: slot } : null;
	}
	return { kind: 'top_level', index: slot };
}

/**
 * Build the ordered list of "rows" treated as one-step targets for Move up /
 * Move down. Mirrors the public plugin's `collectRows`. Walks the rendered
 * Calypso sidebar in document order:
 *   - Each top-level LI (the `<MySitesSidebarUnifiedItem>` / `<MySitesSidebarUnifiedMenu>`
 *     outputs) in the sidebar root.
 *   - Each LI inside an expanded group's `__children` UL.
 *
 * The group container LI is included as a row because its header takes a row
 * of vertical space; the move handler treats it specially (down → enter
 * the group; up → exit to top-level just before the group container).
 */
function collectRows( source?: HTMLElement ): HTMLLIElement[] {
	const rows: HTMLLIElement[] = [];
	const sidebar =
		( source?.closest( 'ul.sidebar' ) as HTMLElement | null ) ||
		( document.querySelector( 'ul.sidebar' ) as HTMLElement | null ) ||
		document.body;
	const walkChildren = ( parent: Element ) => {
		for ( const child of Array.from( parent.children ) ) {
			if ( child.tagName !== 'LI' ) {
				continue;
			}
			if (
				child.classList.contains( 'admin-sidebar-drop-indicator' ) ||
				child.classList.contains( 'sidebar__region' ) ||
				child.classList.contains( 'collapse-sidebar__toggle' )
			) {
				continue;
			}
			rows.push( child as HTMLLIElement );
			if ( child.classList.contains( 'wp-admin-sidebar-group' ) ) {
				const childList = child.querySelector( ':scope > .wp-admin-sidebar-group__children' );
				if ( childList ) {
					walkChildren( childList );
				}
			}
		}
	};
	walkChildren( sidebar );
	return rows;
}

export default MoveMenu;
