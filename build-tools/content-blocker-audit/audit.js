const fs = require( 'fs' );
const path = require( 'path' );
const { parseFilterList, createMatcher, isRelevantRule } = require( './filter-rules' );

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
 * page references directly.
 * @param {string} html    Page HTML.
 * @param {string} pageUrl URL the HTML was fetched from.
 */
function collectAssetsFromPage( html, pageUrl ) {
	const publicPath = /\.p="([^"]+)"/.exec( html )?.[ 1 ];
	if ( ! publicPath ) {
		throw new Error( `Could not find the webpack public path in ${ pageUrl }` );
	}
	const base = new URL( publicPath, pageUrl ).href;
	const assets = new Map();
	const add = ( url, type ) => {
		const name = url.startsWith( base ) ? url.slice( base.length ) : url;
		assets.set( url, { name, url, type } );
	};

	const chunkMaps =
		/\.(u|miniCssF)=\w+=>""\+\(\((\{[^}]*\})\)\[\w+\]\|\|\w+\)\+"\."\+\(?(\{[^}]*\})\)?\[\w+\]\+"([^"]+)"/g;
	let found = 0;
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
		found++;
	}
	if ( ! found ) {
		throw new Error( `Could not find webpack chunk maps in ${ pageUrl }` );
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

/**
 * Load the configured filter lists, downloading any that are not cached yet.
 * @param {Object}  config           Parsed `filter-lists.json`.
 * @param {Object}  options
 * @param {string}  options.cacheDir Directory holding `<id>.txt` copies of each list.
 * @param {boolean} options.offline  Fail instead of downloading missing lists.
 * @param {boolean} options.refresh  Download every list even if cached.
 */
async function loadFilterLists( config, { cacheDir, offline = false, refresh = false } ) {
	fs.mkdirSync( cacheDir, { recursive: true } );
	return Promise.all(
		config.lists.map( async ( { id, url } ) => {
			const file = path.join( cacheDir, `${ id }.txt` );
			if ( refresh || ! fs.existsSync( file ) ) {
				if ( offline ) {
					throw new Error( `Filter list "${ id }" is not cached in ${ cacheDir }` );
				}
				const response = await fetch( url );
				if ( ! response.ok ) {
					throw new Error(
						`Could not download "${ id }" from ${ url }: HTTP ${ response.status }`
					);
				}
				fs.writeFileSync( file, await response.text() );
			}
			const text = fs.readFileSync( file, 'utf8' );
			return { id, url, text, ...describeList( text ) };
		} )
	);
}

function formatRule( rule ) {
	return { list: rule.list, line: rule.line, rule: rule.raw };
}

/**
 * Check assets against filter lists. A control asset that is not blocked means
 * the lists or the matcher no longer catch a known-bad name, so the run is not
 * trustworthy.
 * @param {Object} options
 * @param {Array}  options.lists   Lists returned by `loadFilterLists`.
 * @param {Array}  options.assets  Assets returned by `collectAssets`.
 * @param {Object} options.config  Parsed `filter-lists.json`.
 * @param {string} options.pageUrl Page that loads the assets.
 * @param {string} options.publicPath URL the assets are served from.
 */
function audit( { lists, assets, config, pageUrl, publicPath } ) {
	const context = { pageHosts: config.pageHosts, assetHosts: config.assetHosts };
	const rules = lists.flatMap( ( list ) =>
		parseFilterList( list.text, list.id ).filter( ( rule ) => isRelevantRule( rule, context ) )
	);
	const matcher = createMatcher( rules );

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
		lists: lists.map( ( { id, url, title, version, last_modified } ) => ( {
			id,
			url,
			title,
			version,
			lastModified: last_modified,
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

module.exports = { audit, collectAssets, collectAssetsFromPage, loadFilterLists };
