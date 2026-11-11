/**
 * Untangling prototype, static hosting (Spacefast).
 *
 * A static copy of the MSD has no WordPress.com session, so the REST proxy
 * cannot run. When the HTML shell sets `window.__UNTANGLING_STATIC__`, every
 * wpcom request is answered from that object instead of the network:
 *
 *   window.__UNTANGLING_STATIC__ = {
 *     responses: { 'GET /me': { ... }, 'GET /sites/:id/purchases': [] },
 *   };
 *
 * Keys are `METHOD /path`. A star in a key matches one path segment (written
 * `:id` in the example above only because a star would end this comment). Anything
 * without a fixture fails with a 404 and is listed in
 * `window.__UNTANGLING_STATIC__.missed`, so gaps are easy to find. Without the
 * flag this file does nothing: local development and calypso.live are
 * unaffected.
 */
export function isStaticPrototype() {
	return typeof window !== 'undefined' && !! window.__UNTANGLING_STATIC__;
}

function findFixture( responses, key ) {
	if ( key in responses ) {
		return responses[ key ];
	}
	for ( const pattern of Object.keys( responses ) ) {
		if ( ! pattern.includes( '*' ) ) {
			continue;
		}
		const expression = new RegExp(
			'^' +
				pattern
					.split( '*' )
					.map( ( part ) => part.replace( /[.+?^${}()|[\]\\]/g, '\\$&' ) )
					.join( '[^/]+' ) +
				'$'
		);
		if ( expression.test( key ) ) {
			return responses[ pattern ];
		}
	}
	return undefined;
}

const PREFERENCES_STORAGE_KEY = 'untangling-static-preferences';

/**
 * Preferences are the one endpoint that has to remember what it was told:
 * dismissing a product tour, a notice or a callout saves a preference, and the
 * UI only goes away once the saved value comes back. They are kept in the
 * browser, so each viewer has their own and a reload keeps them.
 */
function readPreferences( responses ) {
	const defaults = responses[ 'GET /me/preferences' ]?.calypso_preferences ?? {};
	try {
		const stored = JSON.parse( window.localStorage.getItem( PREFERENCES_STORAGE_KEY ) || '{}' );
		return { ...defaults, ...stored };
	} catch {
		return { ...defaults };
	}
}

function writePreferences( responses, changes ) {
	const next = { ...readPreferences( responses ) };
	for ( const [ name, value ] of Object.entries( changes || {} ) ) {
		// The API removes a preference that is saved as null.
		if ( value === null ) {
			delete next[ name ];
		} else {
			next[ name ] = value;
		}
	}
	try {
		window.localStorage.setItem( PREFERENCES_STORAGE_KEY, JSON.stringify( next ) );
	} catch {
		// Storage can be unavailable (private window). The change then lasts
		// only until the next read, which is still better than failing.
	}
	return next;
}

export default function prototypeStaticHandler( params, callback ) {
	const state = window.__UNTANGLING_STATIC__;
	const method = ( params.method || 'GET' ).toUpperCase();
	const path = String( params.path || '' ).split( '?' )[ 0 ];
	const key = `${ method } ${ path }`;
	const done = typeof callback === 'function' ? callback : () => {};

	// The proxy "access all users blogs" upgrade and other meta calls.
	if ( params.metaAPI ) {
		setTimeout( () => done( null, {}, { status: 200 } ), 0 );
		return;
	}

	if ( path === '/me/preferences' && ( method === 'GET' || method === 'POST' ) ) {
		const responses = state.responses || {};
		const preferences =
			method === 'POST'
				? writePreferences( responses, params.body?.calypso_preferences )
				: readPreferences( responses );
		setTimeout( () => done( null, { calypso_preferences: preferences }, { status: 200 } ), 0 );
		return;
	}

	const fixture = findFixture( state.responses || {}, key );
	setTimeout( () => {
		if ( fixture === undefined ) {
			state.missed = state.missed || [];
			if ( ! state.missed.includes( key ) ) {
				state.missed.push( key );
			}
			const error = new Error( `No fixture for ${ key }` );
			error.error = 'not_found';
			error.status = 404;
			error.statusCode = 404;
			done( error, null, { status: 404 } );
			return;
		}
		// A fresh copy per call, so callers that mutate a response cannot
		// change the fixture for the next one.
		done( null, JSON.parse( JSON.stringify( fixture ) ), { status: 200 } );
	}, 0 );
}
