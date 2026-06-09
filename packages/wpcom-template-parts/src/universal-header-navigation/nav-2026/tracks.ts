import { recordTracksEvent } from '@automattic/calypso-analytics';

/*
 * `wpcom_global_nav_*` Tracks events for the 2026 Global Nav. These match the
 * landpack reference (`wp-content/plugins/landpack/src/client/nav/tracks.js`)
 * name-for-name and prop-for-prop, so the React (Calypso) and PHP (landpack)
 * arms of the redesign A/B test feed one unified Tracks dataset. The reference
 * is DOM-event driven; here we fire straight from the React handlers/state.
 *
 * `recordTracksEvent` only emits names prefixed with a known source unless
 * they're listed in `EVENT_NAME_EXCEPTIONS` (packages/calypso-analytics);
 * each `wpcom_global_nav_*` name below is registered there.
 */

type TracksProps = Record< string, string | number | boolean | null | undefined >;

// Dedupe so re-entering the same item doesn't emit duplicate hovers.
let lastHoverName: string | null = null;

export function resetNavHoverDedupe(): void {
	lastHoverName = null;
}

function record( name: string, isFloating: boolean, props: TracksProps = {} ): void {
	recordTracksEvent( name, { is_2026: true, is_floating: isFloating, ...props } );
}

export function recordNavItemHover( isFloating: boolean, name: string, isDropdown: boolean ): void {
	if ( ! name || name === lastHoverName ) {
		return;
	}
	lastHoverName = name;
	record( 'wpcom_global_nav_item_hover', isFloating, { name, is_dropdown: isDropdown } );
}

export function recordSubmenuShow( isFloating: boolean, name: string ): void {
	record( 'wpcom_global_nav_submenu_show', isFloating, { name } );
}

export function recordSubmenuHide( isFloating: boolean, name: string ): void {
	record( 'wpcom_global_nav_submenu_hide', isFloating, { name } );
}

export function recordMobileMenuOpen( isFloating: boolean ): void {
	record( 'wpcom_global_nav_mobile_menu_open', isFloating, {
		start_type: 'burger_menu',
		viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
	} );
}

export function recordMobileMenuClose( isFloating: boolean, reason: string ): void {
	record( 'wpcom_global_nav_mobile_menu_close', isFloating, {
		reason,
		viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
	} );
}

export function recordMobileCategorySelect(
	isFloating: boolean,
	name: string,
	title: string
): void {
	record( 'wpcom_global_nav_mobile_category_select', isFloating, { name, title } );
}

export function recordMobileBack( isFloating: boolean, fromName: string | null ): void {
	record( 'wpcom_global_nav_mobile_back', isFloating, { from_name: fromName } );
}

interface ResolvedLink {
	source: 'mobile_dropdown' | 'desktop_dropdown' | 'logo' | 'top_level';
	category: string | null;
}

// Resolve which part of the nav a clicked link came from, for the click event.
// Mirrors `resolveLink()` in the landpack reference.
function resolveLink( link: HTMLElement ): ResolvedLink {
	const mobileList = link.closest< HTMLElement >( '.x-menu-mobile-dropdown-list' );
	if ( mobileList ) {
		return { source: 'mobile_dropdown', category: mobileList.dataset.dropdownName || null };
	}

	if ( link.closest( '.x-menu' ) ) {
		return { source: 'mobile_dropdown', category: null };
	}

	if ( link.closest( '.x-dropdown' ) ) {
		const content = link.closest< HTMLElement >( '.x-dropdown-content' );
		return { source: 'desktop_dropdown', category: content?.dataset.dropdownName || null };
	}

	if ( link.closest( '.x-nav-link__logo' ) ) {
		return { source: 'logo', category: null };
	}

	return { source: 'top_level', category: null };
}

export function recordNavLinkClick( link: HTMLAnchorElement ): void {
	// Resolve `is_2026`/`is_floating` from the DOM (not React state) so this works
	// from a plain click handler and matches the landpack reference, which fires
	// for both the legacy and 2026 navs with `is_2026` telling them apart.
	const is2026 = !! link.closest( '.x-nav--2026-redesign, .x-dropdown--2026, .x-menu--2026' );
	const isFloating = !! link.closest( '.lpc-header-nav-container.is-scrolled' );
	const { source, category } = resolveLink( link );

	recordTracksEvent( 'wpcom_global_nav_link_click', {
		is_2026: is2026,
		is_floating: isFloating,
		href: link.href,
		text: ( link.textContent || '' ).trim(),
		name: link.dataset.dropdownTrigger || null,
		source,
		category,
	} );
}

/*
 * Legacy (flag-off) nav telemetry for the A/B control arm — the same events with
 * `is_2026: false`. `is_floating` falls back to `scrollY` (the legacy nav has no
 * `is-scrolled` class), matching the reference's `isFloating()`.
 */
function recordLegacy( name: string, props: TracksProps = {} ): void {
	const isFloating = typeof window !== 'undefined' && window.scrollY > 0;
	recordTracksEvent( name, { is_2026: false, is_floating: isFloating, ...props } );
}

export function recordLegacyMobileMenuOpen(): void {
	recordLegacy( 'wpcom_global_nav_mobile_menu_open', {
		start_type: 'burger_menu',
		viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
	} );
}

export function recordLegacyMobileMenuClose( reason: string ): void {
	recordLegacy( 'wpcom_global_nav_mobile_menu_close', {
		reason,
		viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
	} );
}

// The legacy nav opens dropdowns via CSS `:hover` (no React state to tap), so —
// like the reference's `tracks.js` — bind DOM listeners for the hover/submenu
// events. Returns a cleanup. (The legacy mobile menu IS React-state driven, so
// its open/close fire from the handlers above, not here.)
export function bindLegacyNavTracks( nav: HTMLElement ): () => void {
	const cleanups: Array< () => void > = [];
	let legacyLastHover: string | null = null;
	let openSubmenu: string | null = null;

	nav.querySelectorAll< HTMLElement >( '.x-nav-item__wide' ).forEach( ( item ) => {
		const content = item.querySelector< HTMLElement >( '.x-dropdown-content[data-dropdown-name]' );
		if ( ! content ) {
			// Non-dropdown wide item (Support, Pricing, Log In, Get Started): hover only.
			const link = item.querySelector< HTMLElement >( '.x-nav-link' );
			if ( ! link ) {
				return;
			}
			const name = ( link.textContent || '' ).trim();
			const onEnter = () => {
				if ( ! name || name === legacyLastHover ) {
					return;
				}
				legacyLastHover = name;
				recordLegacy( 'wpcom_global_nav_item_hover', { name, is_dropdown: false } );
			};
			item.addEventListener( 'mouseenter', onEnter );
			cleanups.push( () => item.removeEventListener( 'mouseenter', onEnter ) );
			return;
		}

		const name = content.dataset.dropdownName || '';
		const onEnter = () => {
			if ( name && name !== legacyLastHover ) {
				legacyLastHover = name;
				recordLegacy( 'wpcom_global_nav_item_hover', { name, is_dropdown: true } );
			}
			openSubmenu = name;
			recordLegacy( 'wpcom_global_nav_submenu_show', { name } );
		};
		const onLeave = () => {
			recordLegacy( 'wpcom_global_nav_submenu_hide', { name: openSubmenu } );
			openSubmenu = null;
			legacyLastHover = null;
		};
		item.addEventListener( 'mouseenter', onEnter );
		item.addEventListener( 'mouseleave', onLeave );
		cleanups.push( () => {
			item.removeEventListener( 'mouseenter', onEnter );
			item.removeEventListener( 'mouseleave', onLeave );
		} );
	} );

	// Logo has no text, so name it explicitly.
	const logo = nav.querySelector< HTMLElement >( '.x-nav-link__logo' );
	if ( logo ) {
		const onLogo = () => {
			if ( legacyLastHover !== 'logo' ) {
				legacyLastHover = 'logo';
				recordLegacy( 'wpcom_global_nav_item_hover', { name: 'logo', is_dropdown: false } );
			}
		};
		logo.addEventListener( 'mouseenter', onLogo );
		cleanups.push( () => logo.removeEventListener( 'mouseenter', onLogo ) );
	}

	return () => cleanups.forEach( ( fn ) => fn() );
}
