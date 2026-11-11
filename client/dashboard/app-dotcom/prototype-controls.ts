import './prototype-controls.scss';
import './wpadmin-sidebar.scss';
import './wpadmin-style.scss';
import './hybrid-sidebar.scss';

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

// The omnibar upsell pill is production's own `free-domain-upsell` node, fed
// by the mock site admin bar (see mock-sites.ts). Two prototype fixes ride on
// its click: the return legs must lead back to the MSD page the user is on,
// and the dashboard SPA must not swallow the link (its router has no /setup
// route), so force the full page load the stepper needs.
function withMsdReturn( href: string ): string {
	try {
		const url = new URL( href, window.location.href );
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

function watchOmnibar() {
	document.addEventListener(
		'click',
		( event ) => {
			const target = event.target instanceof Element ? event.target : null;
			const pill = target?.closest< HTMLElement >( '#wpcom-omnibar .omnibar__free-domain-upsell' );
			const anchor = pill?.matches( 'a' )
				? pill
				: ( pill?.querySelector( 'a' ) ?? target?.closest( 'a' ) );
			const href = anchor instanceof HTMLAnchorElement ? anchor.href : '';
			if ( ! pill || ! href || ! href.includes( 'untangling' ) ) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			window.location.assign( withMsdReturn( href ) );
		},
		true
	);
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
