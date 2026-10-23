const fs = require( 'fs' );
const path = require( 'path' );
const {
	parseFilterList,
	listIncludes,
	createMatcher,
	isRelevantRule,
} = require( './filter-rules' );

const ASSET_EXTENSIONS = {
	'.js': 'script',
	'.css': 'stylesheet',
};

function walk( dir ) {
	return fs.readdirSync( dir, { withFileTypes: true } ).flatMap( ( entry ) => {
		const fullPath = path.join( dir, entry.name );
		return entry.isDirectory() ? walk( fullPath ) : [ fullPath ];
	} );
}

/**
 * List the JavaScript and CSS files in a build output directory, as the URLs a
 * browser would request them from.
 * @param {string} dir        Output directory, e.g. `public/evergreen`.
 * @param {string} publicPath Absolute URL the directory is served from.
 */
function collectAssets( dir, publicPath ) {
	const base = publicPath.endsWith( '/' ) ? publicPath : `${ publicPath }/`;
	return walk( dir )
		.map( ( file ) => path.relative( dir, file ).split( path.sep ).join( '/' ) )
		.filter( ( name ) => ASSET_EXTENSIONS[ path.extname( name ) ] )
		.sort()
		.map( ( name ) => ( {
			name,
			url: new URL( name, base ).href,
			type: ASSET_EXTENSIONS[ path.extname( name ) ],
		} ) );
}

function parseObjectLiteral( source ) {
	return JSON.parse( source.replace( /([{,])\s*([\w$-]+)\s*:/g, '$1"$2":' ) );
}

/**
 * List the chunk URLs a deployed page can load, by reading the chunk name and
 * hash maps out of the inline webpack runtime (`__webpack_require__.u` for
 * scripts and `.miniCssF` for stylesheets), plus the scripts and stylesheets the
 * page references directly from the same public path. Other scripts on the page,
 * such as stats or RUM beacons, are left out: blockers refuse some of them on
 * purpose, and they are not Calypso chunks.
 * @param {string} html    Page HTML.
 * @param {string} pageUrl URL the HTML was fetched from.
 */
function collectAssetsFromPage( html, pageUrl ) {
	const publicPath = /\.p="([^"]+)"/.exec( html )?.[ 1 ];
	if ( ! publicPath ) {
		const hint = isBotChallenge( html ) ? ' (the response is a bot challenge page)' : '';
		throw new Error( `Could not find the webpack public path in ${ pageUrl }${ hint }` );
	}
	const base = new URL( publicPath, pageUrl ).href;
	const assets = new Map();
	const add = ( url, type ) => {
		if ( url.startsWith( base ) ) {
			assets.set( url, { name: url.slice( base.length ), url, type } );
		}
	};

	const chunkMaps =
		/\.(u|miniCssF)=\w+=>(?:""\+)?\(\((\{[^}]*\})\)\[\w+\]\|\|\w+\)\+"\."\+\(?(\{[^}]*\})\)?\[\w+\]\+"([^"]+)"/g;
	const missing = new Set( [ 'script', 'stylesheet' ] );
	for ( const [ , kind, namesSource, hashesSource, suffix ] of html.matchAll( chunkMaps ) ) {
		const names = parseObjectLiteral( namesSource );
		const hashes = parseObjectLiteral( hashesSource );
		const type = kind === 'u' ? 'script' : 'stylesheet';
		for ( const [ id, hash ] of Object.entries( hashes ) ) {
			const file = `${ names[ id ] ?? id }.${ hash }${ suffix }`;
			add( new URL( file, base ).href, type );
			if ( type === 'stylesheet' ) {
				add( new URL( file.replace( '.css', '.rtl.css' ), base ).href, type );
			}
		}
		missing.delete( type );
	}
	// The runtime always emits both maps; a missing one means the regex above no
	// longer matches the minified output, so fail rather than audit half the chunks.
	if ( missing.size ) {
		throw new Error(
			`Could not find webpack chunk maps in ${ pageUrl } (missing: ${ [ ...missing ].join( ', ' ) })`
		);
	}

	for ( const [ , src ] of html.matchAll( /<script[^>]+src="([^"]+\.js)"/g ) ) {
		add( new URL( src, pageUrl ).href, 'script' );
	}
	for ( const [ , href ] of html.matchAll(
		/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/g
	) ) {
		add( new URL( href, pageUrl ).href, 'stylesheet' );
	}

	return {
		publicPath: base,
		assets: [ ...assets.values() ].sort( ( a, b ) => a.name.localeCompare( b.name ) ),
	};
}

function describeList( text ) {
	const header = {};
	for ( const line of text.split( /\r?\n/, 40 ) ) {
		const match = /^!\s*(Title|Version|Last modified)\s*:\s*(.+)$/i.exec( line );
		if ( match ) {
			header[ match[ 1 ].toLowerCase().replace( ' ', '_' ) ] = match[ 2 ].trim();
		}
	}
	return header;
}

const wait = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

/**
 * Fetch a URL, retrying network errors, 429s and 5xx responses so a brief outage
 * on a list host or wordpress.com does not fail the run.
 * @param {string} url
 * @param {Object} options
 * @param {number} options.attempts Total attempts.
 * @param {number} options.delayMs  Delay before the first retry; doubles after each one.
 * @param {Function} options.rejectBody Given the body of a 2xx response, returns why it
 *                                      should be retried, or nothing to accept it.
 */
async function fetchWithRetry( url, { attempts = 3, delayMs = 2000, rejectBody } = {} ) {
	let lastError;
	for ( let attempt = 1; attempt <= attempts; attempt++ ) {
		if ( attempt > 1 ) {
			await wait( delayMs * 2 ** ( attempt - 2 ) );
		}
		try {
			const response = await fetch( url, { signal: AbortSignal.timeout( 30000 ) } );
			if ( response.ok ) {
				const body = await response.text();
				const reason = rejectBody?.( body );
				if ( ! reason ) {
					return body;
				}
				lastError = reason;
				continue;
			}
			lastError = `HTTP ${ response.status }`;
			if ( response.status !== 429 && response.status < 500 ) {
				break;
			}
		} catch ( error ) {
			lastError = error.message;
		}
	}
	throw new Error( `Could not fetch ${ url }: ${ lastError }` );
}

function isBotChallenge( html ) {
	return html.includes( '/__challenge/' );
}

/**
 * Fetch a wordpress.com page. The bot challenge comes back as a 200, and clears
 * on its own within seconds, so it is retried like a server error.
 * @param {string} url
 * @param {Object} options Options for `fetchWithRetry`.
 */
function fetchPage( url, options = {} ) {
	return fetchWithRetry( url, {
		attempts: 4,
		delayMs: 5000,
		rejectBody: ( html ) => ( isBotChallenge( html ) ? 'bot challenge page' : undefined ),
		...options,
	} );
}

/**
 * Read a cached download, fetching it first when it is missing or `refresh` is
 * set. A failed refresh falls back to the cached copy and marks it stale.
 */
async function loadCached( file, url, label, { offline, refresh, fetchOptions } ) {
	const cached = fs.existsSync( file );
	let stale = false;
	if ( refresh || ! cached ) {
		if ( offline ) {
			throw new Error( `Filter list "${ label }" is not cached in ${ path.dirname( file ) }` );
		}
		try {
			fs.writeFileSync( file, await fetchWithRetry( url, fetchOptions ) );
		} catch ( error ) {
			if ( ! cached ) {
				throw new Error( `Could not download "${ label }": ${ error.message }` );
			}
			console.warn( `Using the cached copy of "${ label }": ${ error.message }` );
			stale = true;
		}
	}
	return { text: fs.readFileSync( file, 'utf8' ), stale };
}

/**
 * Load the configured filter lists, downloading any that are not cached yet,
 * along with the sublists they `!#include` on the audited platforms. A sublist
 * that cannot be downloaded is left out with a warning: the list still works
 * without it, and a missing optional file should not fail the whole run.
 * @param {Object}  config           Parsed `filter-lists.json`.
 * @param {Object}  options
 * @param {string}  options.cacheDir Directory holding `<id>.txt` copies of each list.
 * @param {boolean} options.offline  Fail instead of downloading missing lists.
 * @param {boolean} options.refresh  Download every list even if cached.
 * @param {Object}  options.fetchOptions Options for `fetchWithRetry`.
 */
async function loadFilterLists(
	config,
	{ cacheDir, offline = false, refresh = false, fetchOptions }
) {
	fs.mkdirSync( cacheDir, { recursive: true } );
	const options = { offline, refresh, fetchOptions };
	return Promise.all(
		config.lists.map( async ( { id, url } ) => {
			const list = await loadCached( path.join( cacheDir, `${ id }.txt` ), url, id, options );
			const includes = {};
			let stale = list.stale;
			await Promise.all(
				listIncludes( list.text )
					// Includes are plain sibling file names; anything else is not followed.
					.filter( ( name ) => /^[\w.-]+\.txt$/.test( name ) )
					.map( async ( name ) => {
						const label = `${ id }/${ name }`;
						try {
							const include = await loadCached(
								path.join( cacheDir, `${ id }--${ name }` ),
								new URL( name, url ).href,
								label,
								options
							);
							includes[ name ] = include.text;
							stale ||= include.stale;
						} catch ( error ) {
							console.warn( `Skipping sublist "${ label }": ${ error.message }` );
						}
					} )
			);
			return { id, url, text: list.text, includes, stale, ...describeList( list.text ) };
		} )
	);
}

function formatRule( rule ) {
	return { list: rule.list, line: rule.line, rule: rule.raw };
}

/**
 * Parse the lists and keep the rules that can affect Calypso's assets. This is
 * the slow part of a run, so build it once and pass it to every `audit` call.
 * @param {Array}  lists  Lists returned by `loadFilterLists`.
 * @param {Object} config Parsed `filter-lists.json`.
 */
function buildMatcher( lists, config ) {
	const context = { pageHosts: config.pageHosts, assetHosts: config.assetHosts };
	return createMatcher(
		lists.flatMap( ( list ) =>
			parseFilterList( list.text, list.id, list.includes ).filter( ( rule ) =>
				isRelevantRule( rule, context )
			)
		)
	);
}

/**
 * Check assets against filter lists. A control asset that is not blocked means
 * the lists or the matcher no longer catch a known-bad name, so the run is not
 * trustworthy.
 * @param {Object} options
 * @param {Array}  options.lists   Lists returned by `loadFilterLists`.
 * @param {Object} options.matcher Matcher from `buildMatcher`; built from `lists` if omitted.
 * @param {Array}  options.assets  Assets returned by `collectAssets`.
 * @param {Object} options.config  Parsed `filter-lists.json`.
 * @param {string} options.pageUrl Page that loads the assets.
 * @param {string} options.publicPath URL the assets are served from.
 */
function audit( {
	lists,
	config,
	matcher = buildMatcher( lists, config ),
	assets,
	pageUrl,
	publicPath,
} ) {
	const check = ( asset ) => {
		const result = matcher.match( { url: asset.url, type: asset.type, pageUrl } );
		return {
			...asset,
			blocked: result.blocked,
			blockedBy: result.blockedBy.map( formatRule ),
			allowedBy: result.allowedBy.map( formatRule ),
		};
	};

	const controls = collectControls( config, publicPath ).map( check );
	const results = assets.map( check );

	return {
		pageUrl,
		lists: lists.map( ( { id, url, title, version, last_modified, stale } ) => ( {
			id,
			url,
			title,
			version,
			lastModified: last_modified,
			stale,
		} ) ),
		rulesEvaluated: matcher.size,
		assetsScanned: assets.length,
		controls,
		controlsPassed: controls.every( ( control ) => control.blocked ),
		blocked: results.filter( ( result ) => result.blocked ),
		allowedByException: results.filter(
			( result ) => ! result.blocked && result.blockedBy.length > 0
		),
	};
}

function collectControls( config, publicPath ) {
	const base = publicPath.endsWith( '/' ) ? publicPath : `${ publicPath }/`;
	return config.controls.map( ( { name, reason } ) => ( {
		name,
		reason,
		url: new URL( name, base ).href,
		type: ASSET_EXTENSIONS[ path.extname( name ) ],
	} ) );
}

module.exports = {
	audit,
	buildMatcher,
	collectAssets,
	collectAssetsFromPage,
	fetchPage,
	fetchWithRetry,
	loadFilterLists,
};
