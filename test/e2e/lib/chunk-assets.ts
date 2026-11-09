export interface ChunkAsset {
	/** Path under the webpack public path, e.g. `entry-stepper.abc123.min.js`. */
	name: string;
	url: string;
	type: 'script' | 'stylesheet';
}

export interface PageChunkAssets {
	publicPath: string;
	assets: ChunkAsset[];
}

function parseObjectLiteral( source: string ): Record< string, string > {
	return JSON.parse( source.replace( /([{,])\s*([\w$-]+)\s*:/g, '$1"$2":' ) );
}

/**
 * Lists every script and stylesheet URL a Calypso page can load, by reading the
 * chunk name and hash maps out of the webpack runtime inlined in the page
 * (`__webpack_require__.u` for scripts, `.miniCssF` for stylesheets), plus the
 * scripts and stylesheets the page references directly from the same public path.
 * That covers every async chunk, not only the ones the page loads up front.
 *
 * Other scripts on the page, such as stats or RUM beacons, are left out: blockers
 * refuse some of them on purpose, and they are not Calypso chunks.
 *
 * All entry points share one runtime, so the chunk maps are the same on every
 * page; only the `entry-*` files differ, and the maps do not list those.
 *
 * @param html    Page HTML.
 * @param pageUrl URL the HTML was fetched from.
 */
export function collectChunkAssets( html: string, pageUrl: string ): PageChunkAssets {
	const publicPath = /\.p="([^"]+)"/.exec( html )?.[ 1 ];
	if ( ! publicPath ) {
		const hint = html.includes( '/__challenge/' ) ? ' (the response is a bot challenge page)' : '';
		throw new Error( `Could not find the webpack public path in ${ pageUrl }${ hint }` );
	}
	const base = new URL( publicPath, pageUrl ).href;
	const assets = new Map< string, ChunkAsset >();
	const add = ( url: string, type: ChunkAsset[ 'type' ] ) => {
		if ( url.startsWith( base ) ) {
			assets.set( url, { name: url.slice( base.length ), url, type } );
		}
	};

	// Production serves `.u=e=>(({…})[e]||e)+"."+({…})[e]+".min.js"`; a development
	// build keeps a leading `""+`.
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
			`Could not find webpack chunk maps in ${ pageUrl } (missing: ${ [ ...missing ].join(
				', '
			) })`
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
