const FLYOUT_TOP_VAR = '--am-flyout-top';
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
		const maxTop = window.innerHeight - VIEWPORT_GAP - submenu.offsetHeight;
		const minTop = wrap.getBoundingClientRect().top;
		const top = Math.max( minTop, Math.min( itemTop, maxTop ) );
		item.style.setProperty( FLYOUT_TOP_VAR, `${ top }px` );
	};

	const handlePointerOrFocus = ( event: Event ) => {
		const item = ( event.target as Element ).closest< HTMLElement >( 'li.menu-top' );

		if ( item ) {
			positionFlyout( item );
		}
	};

	// Keep an open flyout glued to its item while the menu scrolls under it.
	const handleScroll = () => {
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
	wrap.addEventListener( 'scroll', handleScroll, { passive: true } );

	return () => {
		document.body.classList.remove( SCROLLABLE_CLASS );
		menu.removeEventListener( 'pointerover', handlePointerOrFocus );
		menu.removeEventListener( 'focusin', handlePointerOrFocus );
		wrap.removeEventListener( 'scroll', handleScroll );
		menu.querySelectorAll< HTMLElement >( 'li.menu-top' ).forEach( ( item ) => {
			item.style.removeProperty( FLYOUT_TOP_VAR );
		} );
	};
}
