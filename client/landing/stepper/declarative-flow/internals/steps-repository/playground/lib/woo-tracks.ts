/**
 * The message a plugin in the WooCommerce Playground store posts to the top
 * window for each WooCommerce Tracks event it forwards. WooCommerce tracking
 * stays off in the store, so Calypso records these as its own events instead:
 *
 * { type: 'woocommerce-playground-tracks', event: 'wcadmin_page_view', properties: { path: 'wc-admin' } }
 */
export const WOO_TRACKS_MESSAGE_TYPE = 'woocommerce-playground-tracks';

// Each forwarded event and the one property kept from it.
const WOO_TRACKS_EVENTS = new Map( [
	[ 'wcadmin_page_view', { name: 'calypso_playground_woo_page_view', property: 'path' } ],
	[ 'wcadmin_task_view', { name: 'calypso_playground_woo_task_view', property: 'task_name' } ],
] );

// Anything in the store can post these, so only short slugs and URL paths are
// recorded: `analytics_overview` for WooCommerce's own pages, and
// `/wp-admin/admin.php?page=wc-settings&tab=general` for the classic ones.
const PROPERTY_VALUE_PATTERN = /^[\w./?&=%:+-]{1,200}$/;

// Classic pages report their URL under the Playground's `/scope:<id>` prefix,
// which would split each page by store.
const PLAYGROUND_SCOPE_PREFIX = /^\/scope:[^/]+/;

// Code in the store can post these in a loop, so a page load records at most
// this many.
export const MAX_WOO_TRACKS_EVENTS = 200;

export interface WooTracksEvent {
	name: string;
	properties: Record< string, string >;
}

/**
 * Maps a message from the Playground store to the Calypso event to record, or
 * null when it isn't a forwarded WooCommerce event Calypso knows about.
 */
export function parseWooTracksMessage( data: unknown ): WooTracksEvent | null {
	if ( ! data || typeof data !== 'object' ) {
		return null;
	}

	const { type, event, properties } = data as {
		type?: unknown;
		event?: unknown;
		properties?: unknown;
	};
	if ( type !== WOO_TRACKS_MESSAGE_TYPE || typeof event !== 'string' ) {
		return null;
	}

	const mapping = WOO_TRACKS_EVENTS.get( event );
	if ( ! mapping || ! properties || typeof properties !== 'object' ) {
		return null;
	}

	const rawValue = ( properties as Record< string, unknown > )[ mapping.property ];
	if ( typeof rawValue !== 'string' ) {
		return null;
	}

	const value = rawValue.replace( PLAYGROUND_SCOPE_PREFIX, '' );
	if ( ! PROPERTY_VALUE_PATTERN.test( value ) ) {
		return null;
	}

	return { name: mapping.name, properties: { [ mapping.property ]: value } };
}
