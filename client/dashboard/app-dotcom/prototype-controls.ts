import './prototype-controls.scss';
import './wpadmin-sidebar.scss';
import './wpadmin-style.scss';
import './hybrid-sidebar.scss';

import {
	isLocalWpAdminOrigin,
	isRemoteMsd,
	siteWpAdminLandingUrl,
} from '../sites/overview-blogger/mock-sites';

/**
 * MSD-side Prototype controls: a fab/panel matching the one injected on every
 * wp-admin screen by the untangling mu-plugin. wp-admin and the MSD are
 * different origins, so its panel cannot reach this app's localStorage — the
 * MSD carries its own copy with the toggles that live on this side:
 * the sidebar variant and the demo persona.
 */

const SIDEBAR_STORAGE_KEY = 'dashboard-demo-sidebar';
const PERSONA_STORAGE_KEY = 'dashboard-demo-persona';

type SidebarVariant = 'default' | 'hybrid' | 'wpadmin';

function isSidebarVariant( value: string | null ): value is SidebarVariant {
	return value === 'default' || value === 'hybrid' || value === 'wpadmin';
}

function resolveSidebarVariant(): SidebarVariant {
	if ( typeof window === 'undefined' ) {
		return 'default';
	}
	const requested = new URLSearchParams( window.location.search ).get( 'sidebar' );
	if ( isSidebarVariant( requested ) ) {
		window.localStorage.setItem( SIDEBAR_STORAGE_KEY, requested );
	}
	const stored = window.localStorage.getItem( SIDEBAR_STORAGE_KEY );
	return isSidebarVariant( stored ) ? stored : 'default';
}

function applySidebarVariant( variant: SidebarVariant ) {
	document.documentElement.classList.toggle( 'is-wpadmin-sidebar', variant === 'wpadmin' );
	document.documentElement.classList.toggle( 'is-wpadmin-style', variant === 'wpadmin' );
	document.documentElement.classList.toggle( 'is-hybrid-sidebar', variant === 'hybrid' );
}

function setUrlParam( key: string, value: string ) {
	const url = new URL( window.location.href );
	url.searchParams.set( key, value );
	window.history.replaceState( null, '', url.toString() );
}

const WP_LOGO_PATH =
	'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM3.5 12c0-1.23.26-2.4.73-3.46L8.25 19.6C5.44 18.23 3.5 15.34 3.5 12zm8.5 8.5c-.83 0-1.64-.12-2.4-.35l2.55-7.4 2.61 7.15c.02.04.04.08.06.12-.9.31-1.85.48-2.82.48zm1.17-12.49c.51-.03.97-.08.97-.08.46-.05.4-.73-.05-.7 0 0-1.38.11-2.27.11-.84 0-2.24-.11-2.24-.11-.46-.03-.51.68-.06.7 0 0 .43.05.89.08l1.32 3.62-1.86 5.57-3.09-9.19c.51-.03.97-.08.97-.08.46-.05.4-.73-.05-.7 0 0-1.38.11-2.27.11-.16 0-.35 0-.55-.01C6.42 5.09 9.04 3.5 12 3.5c2.21 0 4.22.84 5.73 2.23-.04 0-.07-.01-.11-.01-.84 0-1.43.73-1.43 1.51 0 .7.4 1.29.84 1.99.33.57.71 1.3.71 2.35 0 .73-.28 1.58-.65 2.76l-.85 2.84-3.07-9.16zm3.1 11.36l2.6-7.51c.49-1.21.65-2.19.65-3.05 0-.31-.02-.6-.06-.87.66 1.21 1.04 2.6 1.04 4.06 0 3.13-1.7 5.86-4.23 7.37z';

function buildSegment(
	label: string,
	options: { value: string; text: string }[],
	current: string,
	onSelect: ( value: string, button: HTMLButtonElement ) => void
): HTMLElement[] {
	const heading = document.createElement( 'label' );
	heading.textContent = label;

	const seg = document.createElement( 'div' );
	seg.className = 'untangling-mproto-seg';
	options.forEach( ( option ) => {
		const button = document.createElement( 'button' );
		button.type = 'button';
		button.textContent = option.text;
		button.dataset.value = option.value;
		if ( option.value === current ) {
			button.classList.add( 'is-active' );
		}
		button.addEventListener( 'click', () => {
			if ( button.classList.contains( 'is-active' ) ) {
				return;
			}
			onSelect( option.value, button );
		} );
		seg.appendChild( button );
	} );

	return [ heading, seg ];
}

function activate( seg: HTMLElement, button: HTMLButtonElement ) {
	seg.querySelectorAll( 'button' ).forEach( ( b ) => b.classList.remove( 'is-active' ) );
	button.classList.add( 'is-active' );
}

/**
 * Omnibar upsell pill — the wp-admin admin bar renders the site's upsell as a
 * pill after the action icons (updates, comments, + New); mirror it here so
 * the offer survives the jump between surfaces. Each Studio site serves its own current offer (it follows
 * the site-type toggle) at /wp-json/untangling/v1/upsell.
 */

interface OmnibarOffer {
	active: boolean;
	pill: string;
	text: string;
	gem: boolean;
	href: string;
}

const GEM_SVG =
	'<svg class="untangling-nudge-gem" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9397 9.87999L15.4197 6.06999L15.3597 6.00999C15.2897 5.93999 15.1997 5.89999 15.0997 5.89999H8.87973C8.77973 5.89999 8.68973 5.93999 8.61973 6.00999L5.05973 9.87999C4.93973 10.01 4.93973 10.21 5.05973 10.34L11.5397 17.86C11.6497 17.99 11.8197 18.07 11.9997 18.07C12.1797 18.07 12.3397 17.99 12.4597 17.86L18.9397 10.34C19.0597 10.21 19.0497 10.01 18.9397 9.87999ZM15.4097 7.53999L17.3297 9.63999H15.1697L15.4097 7.53999ZM14.4297 6.83999L14.1097 9.63999H10.2897L9.64973 6.83999H14.4297ZM8.68973 7.42999L9.19973 9.63999H6.66973L8.68973 7.42999ZM6.61973 10.6H9.42973L10.8397 15.49L6.61973 10.6ZM12.0397 15.87L10.5297 10.6H13.8597L12.0397 15.87ZM14.9697 10.6H17.3797L13.3697 15.24L14.9697 10.6Z"/></svg>';

const offerCache = new Map< string, Promise< OmnibarOffer | null > >();

// The offer's return params are computed on the wp-admin side (the REST
// endpoint spoofs REQUEST_URI to the My Site page). Clicked from the MSD,
// every return leg must lead back here instead — to the page the user is on
// at click time, since the offer is cached while the SPA navigates. Absolute
// URL on purpose: a relative back_to would resolve against the stepper's
// origin, not this app's.
function withMsdReturn( href: string ): string {
	try {
		const url = new URL( href );
		const msdUrl = window.location.href;
		if ( url.searchParams.has( 'back_to' ) ) {
			url.searchParams.set( 'back_to', msdUrl );
		}
		if ( url.searchParams.has( 'back' ) ) {
			url.searchParams.set( 'back', msdUrl );
		}
		const pricing = url.searchParams.get( 'untangling_pricing' );
		if ( pricing ) {
			const pricingUrl = new URL( pricing );
			pricingUrl.searchParams.set( 'back', msdUrl );
			url.searchParams.set( 'untangling_pricing', pricingUrl.toString() );
		}
		return url.toString();
	} catch {
		return href;
	}
}

function fetchOffer( origin: string ): Promise< OmnibarOffer | null > {
	let cached = offerCache.get( origin );
	if ( ! cached ) {
		cached = fetch( `${ origin }/wp-json/untangling/v1/upsell` )
			.then( ( response ) => ( response.ok ? response.json() : null ) )
			.catch( () => null );
		offerCache.set( origin, cached );
	}
	return cached;
}

// wp-admin renders the pill after the action icons (updates, comments,
// + New), not after the site name — mirror that order. Falls back to the
// site link while the actions have not mounted yet. Returns the element the
// pill should sit directly after (the item wrapper, so the pill takes its
// own slot in the bar).
function omnibarNudgeSlot( bar: HTMLElement | null, siteLink: HTMLElement ): HTMLElement | null {
	const actionsItem = bar?.querySelector< HTMLElement >( '.masterbar__item-my-site-actions' );
	const anchor = actionsItem ?? siteLink;
	return ( anchor.closest( '.masterbar__item-wrapper' ) as HTMLElement | null ) ?? anchor;
}

function ensureOmnibarNudge() {
	const bar = document.getElementById( 'wpcom-omnibar' );
	const existing = bar?.querySelector< HTMLElement >( '.untangling-omnibar-nudge' ) ?? null;
	const siteLink = bar?.querySelector< HTMLAnchorElement >( 'a.masterbar__item-my-site' ) ?? null;
	let origin = '';
	try {
		origin = siteLink ? new URL( siteLink.href ).origin : '';
	} catch {
		origin = '';
	}
	if ( ! siteLink || ! isLocalWpAdminOrigin( origin ) ) {
		existing?.remove();
		return;
	}
	if ( existing?.dataset.origin === origin ) {
		// The masterbar mounts progressively; if the action icons appeared
		// after the pill was placed, move the pill back behind them.
		const slot = omnibarNudgeSlot( bar, siteLink );
		if ( slot && slot.nextElementSibling !== existing ) {
			slot.insertAdjacentElement( 'afterend', existing );
		}
		return;
	}
	existing?.remove();
	fetchOffer( origin ).then( ( offer ) => {
		if ( ! offer?.active ) {
			return;
		}
		const currentBar = document.getElementById( 'wpcom-omnibar' );
		const currentSiteLink = currentBar?.querySelector< HTMLAnchorElement >(
			'a.masterbar__item-my-site'
		);
		if ( ! currentSiteLink || currentBar?.querySelector( '.untangling-omnibar-nudge' ) ) {
			return;
		}
		const item = document.createElement( 'a' );
		// --always-show-content opts out of the masterbar's 46px mobile squeeze,
		// so the full pill keeps its width at every viewport.
		item.className =
			'masterbar__item masterbar__item--always-show-content untangling-omnibar-nudge';
		item.href = offer.href;
		item.dataset.origin = origin;
		const pill = document.createElement( 'span' );
		pill.className = 'untangling-nudge-pill';
		pill.setAttribute( 'data-tip', offer.text );
		if ( offer.gem ) {
			pill.innerHTML = GEM_SVG;
		}
		pill.appendChild( document.createTextNode( offer.pill ) );
		item.appendChild( pill );
		// The dashboard SPA intercepts same-origin anchors and its router has no
		// /setup route, so it 404s; force the full load the stepper needs.
		item.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			event.stopPropagation();
			window.location.assign( withMsdReturn( offer.href ) );
		} );
		const slot = omnibarNudgeSlot( currentBar, currentSiteLink );
		slot?.insertAdjacentElement( 'afterend', item );
	} );
}

/**
 * wp-admin's site-name dropdown reads Visit Site / Dashboard / My Site /
 * Stats / Plan; the masterbar's stops at Dashboard. Clone the Dashboard row
 * into a My Site row pointing at the untangled My Site page so both dropdowns
 * match.
 */
function ensureMySiteMenuItem() {
	const bar = document.getElementById( 'wpcom-omnibar' );
	const siteLink = bar?.querySelector< HTMLAnchorElement >( 'a.masterbar__item-my-site' ) ?? null;
	if ( ! siteLink ) {
		return;
	}
	let origin = '';
	try {
		origin = new URL( siteLink.href ).origin;
	} catch {
		return;
	}
	if ( ! isLocalWpAdminOrigin( origin ) ) {
		return;
	}
	const wrapper = siteLink.closest( '.masterbar__item-wrapper' ) ?? siteLink.parentElement;
	if ( ! wrapper || wrapper.querySelector( '.untangling-my-site-subitem' ) ) {
		return;
	}
	const dashboardItem = Array.from( wrapper.querySelectorAll< HTMLAnchorElement >( 'a' ) ).find(
		( anchor ) => anchor !== siteLink && anchor.textContent?.trim() === 'Dashboard'
	);
	if ( ! dashboardItem ) {
		return;
	}
	const row = dashboardItem.closest( 'li' ) ?? dashboardItem;
	const clone = row.cloneNode( true ) as HTMLElement;
	clone.classList.add( 'untangling-my-site-subitem' );
	const cloneLink = clone.matches( 'a' )
		? ( clone as HTMLAnchorElement )
		: ( clone.querySelector( 'a' ) as HTMLAnchorElement | null );
	if ( ! cloneLink ) {
		return;
	}
	cloneLink.textContent = 'My Site';
	cloneLink.href =
		siteWpAdminLandingUrl( `${ origin }/wp-admin/` ) ??
		`${ origin }/wp-admin/admin.php?page=untangling-mysite`;
	row.insertAdjacentElement( 'afterend', clone );
}

// On a remote MSD the omnibar's Studio-backed links (updates, comments,
// Dashboard rows fed by the mock admin_url) point at unreachable localhost
// origins — collapse them onto the site's Playground stand-in.
function rewriteLocalAdminLinks() {
	if ( ! isRemoteMsd() ) {
		return;
	}
	const bar = document.getElementById( 'wpcom-omnibar' );
	bar
		?.querySelectorAll< HTMLAnchorElement >( 'a[href^="http://localhost:"]' )
		.forEach( ( anchor ) => {
			try {
				const origin = new URL( anchor.href ).origin;
				if ( isLocalWpAdminOrigin( origin ) ) {
					anchor.href = siteWpAdminLandingUrl( `${ origin }/wp-admin/` ) ?? anchor.href;
				}
			} catch {
				// Not a URL; leave it alone.
			}
		} );
}

function watchOmnibar() {
	// The masterbar mounts and re-renders per route; keep the pill in step.
	const sync = () => {
		ensureOmnibarNudge();
		ensureMySiteMenuItem();
		rewriteLocalAdminLinks();
	};
	const observer = new MutationObserver( sync );
	observer.observe( document.body, { childList: true, subtree: true } );
	sync();
	// Same tooltip behaviour as the wp-admin pill: --untangling-tip-x centres
	// the bubble where the cursor enters the pill, then freezes until the next
	// entry. Crossing the pill's children re-fires mouseover; those are ignored
	// or the bubble jumps. Clamped half a bubble (130px) plus an 8px gutter
	// from the viewport edges.
	document.addEventListener( 'mouseover', ( event ) => {
		const target = event.target instanceof Element ? event.target : null;
		const pill = target?.closest< HTMLElement >( '.untangling-nudge-pill' );
		if ( ! pill ) {
			return;
		}
		if ( event.relatedTarget instanceof Node && pill.contains( event.relatedTarget ) ) {
			return;
		}
		const x = Math.max( 138, Math.min( event.clientX, window.innerWidth - 138 ) );
		pill.style.setProperty( '--untangling-tip-x', `${ x - pill.getBoundingClientRect().left }px` );
	} );
}

function mount() {
	if ( document.querySelector( '.untangling-mproto' ) ) {
		return;
	}

	const wrap = document.createElement( 'div' );
	wrap.className = 'untangling-mproto';

	const fab = document.createElement( 'button' );
	fab.type = 'button';
	fab.className = 'untangling-mproto-fab';
	fab.setAttribute( 'aria-label', 'Prototype controls' );
	fab.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="${ WP_LOGO_PATH }"/></svg>`;

	const panel = document.createElement( 'div' );
	panel.className = 'untangling-mproto-panel';
	panel.hidden = true;

	const head = document.createElement( 'div' );
	head.className = 'untangling-mproto-head';
	const title = document.createElement( 'span' );
	title.textContent = 'Prototype controls';
	const minimize = document.createElement( 'button' );
	minimize.type = 'button';
	minimize.className = 'untangling-mproto-min';
	minimize.setAttribute( 'aria-label', 'Minimize' );
	minimize.textContent = '–';
	head.append( title, minimize );

	const body = document.createElement( 'div' );
	body.className = 'untangling-mproto-body';

	body.append(
		...buildSegment(
			'MSD style',
			[
				{ value: 'default', text: 'Default' },
				{ value: 'hybrid', text: 'Hybrid' },
				{ value: 'wpadmin', text: 'WP Admin' },
			],
			resolveSidebarVariant(),
			( value, button ) => {
				window.localStorage.setItem( SIDEBAR_STORAGE_KEY, value );
				applySidebarVariant( value as SidebarVariant );
				setUrlParam( 'sidebar', value );
				activate( button.parentElement as HTMLElement, button );
			}
		)
	);

	const persona =
		window.localStorage.getItem( PERSONA_STORAGE_KEY ) === 'blogger' ? 'blogger' : 'developer';
	body.append(
		...buildSegment(
			'Persona',
			[
				{ value: 'blogger', text: 'Blogger' },
				{ value: 'developer', text: 'Developer' },
			],
			persona,
			( value ) => {
				// Mock sites are computed at boot, so switching persona reloads.
				window.location.href = `/sites?persona=${ value }&sidebar=${ resolveSidebarVariant() }`;
			}
		)
	);

	const copy = document.createElement( 'button' );
	copy.type = 'button';
	copy.className = 'untangling-mproto-copy';
	copy.textContent = 'Copy link to this view';
	copy.addEventListener( 'click', () => {
		const url = new URL( window.location.href );
		url.searchParams.set( 'sidebar', resolveSidebarVariant() );
		navigator.clipboard.writeText( url.toString() ).then( () => {
			copy.textContent = 'Copied ✓';
			window.setTimeout( () => {
				copy.textContent = 'Copy link to this view';
			}, 2000 );
		} );
	} );
	body.appendChild( copy );

	panel.append( head, body );
	wrap.append( fab, panel );
	document.body.appendChild( wrap );

	const toggle = () => {
		panel.hidden = ! panel.hidden;
		fab.style.visibility = panel.hidden ? '' : 'hidden';
	};
	fab.addEventListener( 'click', toggle );
	minimize.addEventListener( 'click', toggle );
}

export function initPrototypeControls() {
	if ( typeof window === 'undefined' ) {
		return;
	}
	applySidebarVariant( resolveSidebarVariant() );
	const start = () => {
		mount();
		watchOmnibar();
	};
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', start );
	} else {
		start();
	}
}
