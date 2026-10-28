/**
 * The message a plugin in the WooCommerce Playground store posts to the top
 * window for each WooCommerce Tracks event it forwards. WooCommerce tracking
 * stays off in the store, so Calypso records these as its own events instead:
 *
 * { type: 'woocommerce-playground-tracks', event: 'wcadmin_page_view', properties: { path: 'wc-admin' } }
 *
 * `path` is recorded as `woo_path`, since Tracks super props read `path` to
 * decide whether to attach the selected site's `blog_id`.
 */
export const WOO_TRACKS_MESSAGE_TYPE = 'woocommerce-playground-tracks';

// Each forwarded event, the one property kept from it, and the name it is recorded under.
const WOO_TRACKS_EVENTS = new Map( [
	[
		'wcadmin_page_view',
		{ name: 'calypso_playground_woo_page_view', property: 'path', recordAs: 'woo_path' },
	],
	[
		'wcadmin_task_view',
		{ name: 'calypso_playground_woo_task_view', property: 'task_name', recordAs: 'task_name' },
	],
] );

// Anything in the store can post these, so only short slugs and URL paths are
// recorded: `analytics_overview` for WooCommerce's own pages, and
// `/wp-admin/admin.php?page=wc-settings&tab=general` for the classic ones.
const PROPERTY_VALUE_PATTERN = /^[\w./?&=%:+-]{1,200}$/;

// Classic pages report their URL under the Playground's `/scope:<id>` prefix,
// which would split each page by store.
const PLAYGROUND_SCOPE_PREFIX = /^\/scope:[^/]+/;

// The query string of a classic page can hold search terms and IDs, so only the
// keys that name the screen are kept.
const PATH_QUERY_KEYS = [ 'page', 'tab', 'section', 'post_type' ];

// Code in the store can post these in a loop, so each visit to the step records
// at most this many.
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

	const unscopedValue = rawValue.replace( PLAYGROUND_SCOPE_PREFIX, '' );
	const value = mapping.property === 'path' ? keepScreenQueryKeys( unscopedValue ) : unscopedValue;
	if ( ! PROPERTY_VALUE_PATTERN.test( value ) ) {
		return null;
	}

	return { name: mapping.name, properties: { [ mapping.recordAs ]: value } };
}

function keepScreenQueryKeys( path: string ): string {
	const queryStart = path.indexOf( '?' );
	if ( queryStart === -1 ) {
		return path;
	}

	const query = new URLSearchParams( path.slice( queryStart + 1 ) );
	const screenQuery = new URLSearchParams();
	for ( const key of PATH_QUERY_KEYS ) {
		const value = query.get( key );
		if ( value !== null ) {
			screenQuery.set( key, value );
		}
	}

	const search = screenQuery.toString();
	return path.slice( 0, queryStart ) + ( search && `?${ search }` );
}
