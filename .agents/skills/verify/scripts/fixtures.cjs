/**
 * Serves the local app as a made-up user, with no WordPress.com login, for `browse.cjs --fixtures`.
 * See "Fixtures without a login" in ../browser.md.
 */
const path = require( 'node:path' );

const PROXY_HOST = 'public-api.wordpress.com';
const BINDING = '__verifyAnswerFixture';

// The app sends its API requests with postMessage to a `rest-proxy` iframe on PROXY_HOST, which
// answers each one with a message ending in the request's `callback` id. This page stands in for it.
const PROXY_PAGE = `<!doctype html><script>
const parentOrigin = location.hash.slice( 1 );
window.addEventListener( 'message', async ( event ) => {
	if ( event.origin !== parentOrigin ) {
		return;
	}
	const params = typeof event.data === 'string' ? JSON.parse( event.data ) : event.data;
	if ( params.abort ) {
		return;
	}
	if ( params.metaAPI ) {
		parent.postMessage( [ 'metaAPIupdated', 200, {}, params.callback ], parentOrigin );
		return;
	}
	const { status, body } = await window.${ BINDING }( params );
	parent.postMessage(
		[ body, status, { 'Content-Type': 'application/json' }, params.callback ],
		parentOrigin
	);
} );
parent.postMessage( 'ready', parentOrigin );
</script>`;

const PIXEL = Buffer.from( 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', 'base64' );

const avatar = `data:image/svg+xml,${ encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#8c8f94"/></svg>'
) }`;

const ME = {
	ID: 1,
	display_name: 'Test Person',
	username: 'testperson',
	email: 'test@example.com',
	email_verified: true,
	primary_blog: null,
	primary_blog_url: '',
	site_count: 0,
	visible_site_count: 0,
	language: 'en',
	locale_variant: '',
	avatar_URL: avatar,
	profile_URL: 'https://example.com',
	date: '2020-01-01T00:00:00+00:00',
	has_unseen_notes: false,
	user_ip_country_code: 'US',
	logout_URL: 'https://example.com/logout',
	meta: { links: {}, data: { flags: { active_flags: [] } } },
	social_login_connections: [],
	abtests: {},
};

const SETTINGS = {
	display_name: ME.display_name,
	user_login: ME.username,
	user_email: ME.email,
	first_name: '',
	last_name: '',
	description: '',
	user_URL: '',
	avatar_URL: avatar,
	language: 'en',
	locale_variant: '',
};

// What the signed-in shell of the local Dashboard requests on every page, for a user with no
// sites, no purchases and no notifications.
const BASE_FIXTURES = {
	'GET /me': ME,
	'GET /me/settings': SETTINGS,
	'GET /me/preferences': { calypso_preferences: {} },
	'POST /me/preferences': { calypso_preferences: {} },
	'GET /me/sites': { sites: [] },
	'GET /sites': [],
	'GET /upgrades': [],
	'GET /read/teams': { number: 0, teams: [] },
	'GET /notifications': { last_seen_time: '0', number: 0, notes: [] },
	'GET /store-sandbox/status': {
		sandbox_status: false,
		is_editable: false,
		reason_not_editable: '',
	},
	'POST /logstash': {},
};

function baseAnswer( { method, path: apiPath } ) {
	// ExPlat experiments: every user gets the default variation.
	if ( method === 'GET' && apiPath.startsWith( '/experiments/0.1.0/assignments/' ) ) {
		return { variations: {}, ttl: 3600 };
	}
	return BASE_FIXTURES[ `${ method } ${ apiPath }` ];
}

function loadAnswer( file ) {
	return require( path.resolve( file ) ).answer;
}

function label( { method, path: apiPath, apiNamespace } ) {
	return `${ method } ${ apiPath }${ apiNamespace ? ` (${ apiNamespace })` : '' }`;
}

// Some fetchers put the query string in the path, and wpcom.js sends arrays as `key[]=a&key[]=b`.
// Merge both into one object, with repeated and `key[]` parameters as arrays.
function toRequest( params ) {
	const [ apiPath, search = '' ] = params.path.split( /\?(.*)/s );
	const entries = [ ...new URLSearchParams( search ) ];
	if ( typeof params.query === 'string' ) {
		entries.push( ...new URLSearchParams( params.query ) );
	} else if ( params.query ) {
		entries.push( ...Object.entries( params.query ) );
	}
	const query = {};
	for ( const [ rawKey, value ] of entries ) {
		const isArray = rawKey.endsWith( '[]' );
		const key = isArray ? rawKey.slice( 0, -2 ) : rawKey;
		if ( key in query ) {
			query[ key ] = [].concat( query[ key ], value );
		} else {
			query[ key ] = isArray ? [].concat( value ) : value;
		}
	}
	return {
		method: params.method,
		path: apiPath.replace( /(.)\/$/, '$1' ),
		query,
		body: params.body,
		apiNamespace: params.apiNamespace,
	};
}

/**
 * Answers the API requests of every page in `context` from `answer()`, then the base fixtures,
 * and blocks requests to other hosts. Returns what to report: requests with no fixture, requests
 * whose fixture threw, Tracks events and blocked hosts.
 */
async function serveFixtures( context, answer, isLocal ) {
	const report = { unanswered: new Set(), threw: new Set(), tracks: [], blockedHosts: new Set() };

	await context.exposeBinding( BINDING, async ( source, params ) => {
		const request = toRequest( params );
		let result;
		try {
			result = ( await answer( request ) ) ?? baseAnswer( request );
		} catch ( error ) {
			report.threw.add( `${ label( request ) }: ${ error }` );
			return { status: 500, body: { error: 'fixture_error', message: String( error ) } };
		}
		if ( result === undefined && request.path.startsWith( '/pinghub/' ) ) {
			// Live updates: like a quiet connection, never answer.
			return new Promise( () => {} );
		}
		if ( result === undefined ) {
			report.unanswered.add( label( request ) );
			return {
				status: 404,
				body: { error: 'no_fixture', message: `No fixture for ${ label( request ) }` },
			};
		}
		if ( result && typeof result === 'object' && '__status' in result ) {
			const { __status, ...body } = result;
			return { status: __status, body };
		}
		return { status: 200, body: result };
	} );

	await context.route(
		( url ) => /^https?:$/.test( url.protocol ) && ! isLocal( url.toString() ),
		( route ) => {
			const url = new URL( route.request().url() );
			if ( url.hostname === PROXY_HOST && url.pathname.startsWith( '/wp-admin/rest-proxy' ) ) {
				return route.fulfill( { contentType: 'text/html', body: PROXY_PAGE } );
			}
			if ( url.hostname === 'pixel.wp.com' && url.pathname === '/t.gif' ) {
				report.tracks.push( Object.fromEntries( url.searchParams ) );
				return route.fulfill( { contentType: 'image/gif', body: PIXEL } );
			}
			// The public Tracks script, so that the page sends its events to the t.gif above, and
			// the public fonts, so that headings look as they do signed in.
			if (
				( url.hostname === 'stats.wp.com' && url.pathname === '/w.js' ) ||
				( url.hostname === 's1.wp.com' && url.pathname.startsWith( '/i/fonts/' ) )
			) {
				return route.continue();
			}
			report.blockedHosts.add( url.hostname );
			return route.abort( 'blockedbyclient' );
		}
	);

	return report;
}

module.exports = { loadAnswer, serveFixtures };
