const FLYOUT_TOP_VAR = '--am-flyout-top';
const FLYOUT_MAX_HEIGHT_VAR = '--am-flyout-max-height';
// Gates the docked scrollable-menu CSS in `agent-dock/style.scss`; keep in sync
// with `$admin-menu-scrollable-class` there.
const SCROLLABLE_CLASS = 'agents-manager-admin-menu-scrollable';
// Matches the docked frame's `$layout-spacing` gutter.
const VIEWPORT_GAP = 16;

/**
 * The docked layout removes document scroll, so `#adminmenuwrap` must scroll its
 * own overflow — which would clip the admin menu's flyout submenus. The docked CSS
 * switches open flyouts to `position: fixed` so they escape the scroll container,
 * reading their top coordinate from `--am-flyout-top`. This sets that property on
 * the hovered/focused menu item, clamped so the flyout stays inside the viewport
 * (replacing core's `adjustSubmenu()` margin-top correction, which assumes
 * document scroll and is neutralized by the docked CSS). All of that CSS is gated
 * on a body class added here, so the menu keeps core behavior until the script is
 * ready to position the flyouts.
 * Assumes a single active invocation at a time (one layout manager per page):
 * attach/cleanup toggle page-global state (the body class, per-item inline
 * styles) without reference counting.
 * @returns Cleanup function that detaches all listeners, or undefined outside wp-admin.
 */
export default function observeAdminMenuFlyouts(): ( () => void ) | undefined {
	const menu = document.getElementById( 'adminmenu' );
	const wrap = document.getElementById( 'adminmenuwrap' );

	if ( ! menu || ! wrap ) {
		return;
	}

	const positionFlyout = ( item: HTMLElement ) => {
		const submenu = item.querySelector< HTMLElement >( '.wp-submenu' );

		if ( ! submenu ) {
			return;
		}

		const itemTop = item.getBoundingClientRect().top;
		// `scrollHeight` so an earlier max-height cap doesn't skew the measurement.
		const maxTop = window.innerHeight - VIEWPORT_GAP - submenu.scrollHeight;
		const minTop = wrap.getBoundingClientRect().top;
		const top = Math.max( minTop, Math.min( itemTop, maxTop ) );
		item.style.setProperty( FLYOUT_TOP_VAR, `${ top }px` );
		// Cap a flyout taller than the remaining viewport so it scrolls internally —
		// nothing else can bring the tail of a fixed box into view.
		// Floored at 0: a negative length is invalid CSS and would drop the cap.
		item.style.setProperty(
			FLYOUT_MAX_HEIGHT_VAR,
			`${ Math.max( 0, window.innerHeight - VIEWPORT_GAP - top ) }px`
		);
	};

	const handlePointerOrFocus = ( event: Event ) => {
		if ( ! ( event.target instanceof Element ) ) {
			return;
		}

		const item = event.target.closest< HTMLElement >( 'li.menu-top' );

		if ( ! item ) {
			return;
		}

		// pointerover/focusin re-fire for every move between descendants of the
		// same item; the flyout is already positioned, so skip the layout reads.
		const from = ( event as MouseEvent | FocusEvent ).relatedTarget;

		if ( from instanceof Element && item.contains( from ) ) {
			return;
		}

		positionFlyout( item );
	};

	// Keep an open flyout glued to its item while the menu scrolls under it or
	// the viewport resizes.
	const handleScrollOrResize = () => {
		// The wrap must never rest horizontally scrolled (it hides the menu with
		// no scrollbar to recover); focus-driven scrolling can still nudge it.
		if ( wrap.scrollLeft !== 0 ) {
			wrap.scrollLeft = 0;
		}

		const openItem = menu.querySelector< HTMLElement >( 'li.opensub' );

		if ( openItem ) {
			positionFlyout( openItem );
		}
	};

	// A flyout may already be open (hover/focus during app load); give it a
	// position before the gated CSS switches it to `position: fixed`, where it
	// would otherwise sit on the static-position fallback until re-hovered.
	const focusedItem = document.activeElement?.closest< HTMLElement >( 'li.menu-top' );
	const openItem = menu.querySelector< HTMLElement >( 'li.opensub' ) ?? focusedItem;

	if ( openItem && menu.contains( openItem ) ) {
		positionFlyout( openItem );
	}

	document.body.classList.add( SCROLLABLE_CLASS );

	menu.addEventListener( 'pointerover', handlePointerOrFocus );
	menu.addEventListener( 'focusin', handlePointerOrFocus );
	wrap.addEventListener( 'scroll', handleScrollOrResize, { passive: true } );
	window.addEventListener( 'resize', handleScrollOrResize );

	return () => {
		document.body.classList.remove( SCROLLABLE_CLASS );
		menu.removeEventListener( 'pointerover', handlePointerOrFocus );
		menu.removeEventListener( 'focusin', handlePointerOrFocus );
		wrap.removeEventListener( 'scroll', handleScrollOrResize );
		window.removeEventListener( 'resize', handleScrollOrResize );
		menu.querySelectorAll< HTMLElement >( 'li.menu-top' ).forEach( ( item ) => {
			item.style.removeProperty( FLYOUT_TOP_VAR );
			item.style.removeProperty( FLYOUT_MAX_HEIGHT_VAR );
		} );
	};
}
