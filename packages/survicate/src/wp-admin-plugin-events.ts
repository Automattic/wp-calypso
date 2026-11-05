import debug from './debug';
import { invokeSurvicateEvent } from './invoke-event';

type JQueryLike = ( target: Document ) => {
	on: ( events: string, handler: () => void ) => unknown;
};

/**
 * Query args `plugins.php` redirects to after a full-page activate/deactivate,
 * single or bulk.
 */
const PLUGINS_PAGE_EVENTS: [ queryArg: string, eventName: string ][] = [
	[ 'activate', 'pluginActivated' ],
	[ 'activate-multi', 'pluginActivated' ],
	[ 'deactivate', 'pluginDeactivated' ],
	[ 'deactivate-multi', 'pluginDeactivated' ],
];

/**
 * Events `wp.updates` (wp-admin/js/updates.js) triggers on `document` through
 * jQuery after an AJAX action: "Update now" on plugins.php and
 * plugin-install.php, bulk "Update" on plugins.php, and "Activate" on
 * plugin-install.php cards.
 */
const AJAX_EVENTS: [ jQueryEvent: string, eventName: string ][] = [
	[ 'wp-plugin-update-success', 'pluginUpdated' ],
	[ 'wp-plugin-activate-success', 'pluginActivated' ],
];

/**
 * The URL this document was loaded from. wp-admin strips `activate`,
 * `deactivate` & co. from the address bar in `<head>`
 * (`wp_admin_canonical_url()`), before this footer bundle runs, so
 * `location` no longer has them; the navigation entry still does.
 */
function getLoadedUrl(): URL | null {
	try {
		const [ entry ] = performance.getEntriesByType( 'navigation' );
		return new URL( entry?.name || window.location.href );
	} catch {
		return null;
	}
}

/**
 * Invokes the `pluginActivated`, `pluginDeactivated` and `pluginUpdated`
 * Survicate events for plugin actions taken in wp-admin. Each event fires at
 * most once per page, so a bulk action over several plugins counts once.
 *
 * Skipped inside iframes (the plugin-information thickbox, update.php's
 * progress frame) so a survey never opens in a frame.
 */
export function observeWpAdminPluginEvents(): void {
	if ( typeof window === 'undefined' || window.self !== window.top ) {
		return;
	}

	const fired = new Set< string >();
	const fire = ( eventName: string ) => {
		if ( fired.has( eventName ) ) {
			return;
		}
		fired.add( eventName );
		debug( 'wp-admin plugin action: invoking "%s"', eventName );
		invokeSurvicateEvent( eventName );
	};

	const url = getLoadedUrl();

	if ( url?.pathname.endsWith( '/plugins.php' ) ) {
		for ( const [ queryArg, eventName ] of PLUGINS_PAGE_EVENTS ) {
			if ( url.searchParams.get( queryArg ) === 'true' ) {
				fire( eventName );
			}
		}
	}

	// update-core.php runs the selected plugin updates in an iframe, which
	// finishes loading once update.php has streamed every result.
	if (
		url?.pathname.endsWith( '/update-core.php' ) &&
		url.searchParams.get( 'action' ) === 'do-plugin-upgrade'
	) {
		const frame = document.querySelector( 'iframe[src*="action=update-selected"]' );
		frame?.addEventListener( 'load', () => fire( 'pluginUpdated' ), { once: true } );
	}

	const jQuery = ( window as Window & { jQuery?: JQueryLike } ).jQuery;
	if ( typeof jQuery === 'function' ) {
		for ( const [ jQueryEvent, eventName ] of AJAX_EVENTS ) {
			jQuery( document ).on( jQueryEvent, () => fire( eventName ) );
		}
	}
}
