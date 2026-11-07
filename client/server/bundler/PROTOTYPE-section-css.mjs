// PROTOTYPE (DOTMSD-1682): the static CSS closure of an entry or section, from Vite's client module
// graph, so server-rendered pages can link it. Throwaway.
//
// The walk transforms each first-party JS module the closure reaches (the browser needs the same
// transforms next, so they come from cache), records the static imports in source order, and
// returns the CSS in ES module evaluation order: the order Vite's client would inject it.
import path from 'node:path';
import { init, parse } from 'es-module-lexer';

const CSS = /\.(css|scss|sass|less|styl|stylus|pcss|postcss|sss)(\?|$)/;
const SKIP =
	/^\/(@vite|@id|@react-refresh|@calypso|node_modules\/\.vite)\/|\?(.*&)?(inline|raw|url|worker)\b/;
const ASSET = /\.(png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|eot|mp4|webm|json)(\?|$)/;

function clean( url ) {
	return url.replace( /([?&])(t|v)=[^&]*&?/g, '$1' ).replace( /[?&]$/, '' );
}

export function createSectionCss( vite ) {
	const env = vite.environments.client;
	const imports = new Map(); // url -> { result, staticImports }
	const closures = new Map(); // key -> Promise<[{ href, id }]>
	const stats = { walks: 0, transformed: 0 };

	vite.watcher.on( 'all', ( event, file ) => {
		if ( ! CSS.test( file ) || event !== 'change' ) {
			closures.clear();
		}
	} );

	async function staticImportsOf( url ) {
		let result;
		try {
			result = await env.transformRequest( url );
		} catch {
			return [];
		}
		const cached = imports.get( url );
		if ( cached && cached.result === result ) {
			return cached.staticImports;
		}
		stats.transformed++;
		await init;
		let parsed = [];
		try {
			[ parsed ] = parse( result?.code ?? '' );
		} catch {}
		const staticImports = parsed
			.filter( ( i ) => i.d === -1 && i.n )
			.map( ( i ) => clean( i.n ) )
			.filter( ( u ) => u.startsWith( '/' ) && ! SKIP.test( u ) );
		imports.set( url, { result, staticImports } );
		return staticImports;
	}

	async function walk( entryUrls ) {
		stats.walks++;
		const t0 = performance.now();
		const graph = new Map();
		const pending = [];
		const visit = ( url ) => {
			if ( graph.has( url ) || CSS.test( url ) || ASSET.test( url ) ) {
				return;
			}
			graph.set( url, [] );
			pending.push(
				staticImportsOf( url ).then( ( deps ) => {
					graph.set( url, deps );
					deps.forEach( visit );
				} )
			);
		};
		entryUrls.forEach( visit );
		while ( pending.length ) {
			await Promise.all( pending.splice( 0 ) );
		}

		// Post-order DFS in source order: ESM evaluation order.
		const css = [];
		const seen = new Set();
		const dfs = ( url ) => {
			if ( seen.has( url ) ) {
				return;
			}
			seen.add( url );
			if ( CSS.test( url ) ) {
				css.push( url );
				return;
			}
			for ( const dep of graph.get( url ) ?? [] ) {
				dfs( dep );
			}
		};
		entryUrls.forEach( dfs );

		const out = [];
		for ( const url of css ) {
			const mod = await env.moduleGraph.getModuleByUrl( url );
			out.push( {
				href: url + ( url.includes( '?' ) ? '&' : '?' ) + 'direct',
				id: mod?.id ?? ( await env.pluginContainer.resolveId( url ) )?.id,
				url,
			} );
		}
		const ms = performance.now() - t0;
		console.info(
			`[prototype] section css: ${ entryUrls.join( ' + ' ) } → ${ graph.size } modules, ${
				out.length
			} sheets in ${ ms.toFixed( 0 ) }ms`
		);
		return out;
	}

	/**
	 * CSS of `entryUrls`, minus the CSS already linked for `exclude` (the entry, for a section).
	 */
	function cssFor( entryUrls, exclude = [] ) {
		const key = entryUrls.join( ',' ) + '|' + exclude.join( ',' );
		if ( ! closures.has( key ) ) {
			closures.set(
				key,
				( async () => {
					const [ own, excluded ] = await Promise.all( [
						walk( entryUrls ),
						exclude.length ? cssFor( exclude ) : [],
					] );
					const skip = new Set( excluded.map( ( s ) => s.url ) );
					return own.filter( ( s ) => ! skip.has( s.url ) );
				} )()
			);
		}
		return closures.get( key );
	}

	// One stylesheet per closure: compiled CSS of every sheet, concatenated.
	async function combined( entryUrls, exclude ) {
		const sheets = await cssFor( entryUrls, exclude );
		const parts = await Promise.all(
			sheets.map( async ( s ) => ( await env.transformRequest( s.href ) )?.code ?? '' )
		);
		return parts.join( '\n' );
	}

	async function resolveUrl( specifier ) {
		const resolved = await env.pluginContainer.resolveId(
			specifier,
			path.join( vite.config.root, 'index.html' )
		);
		if ( ! resolved?.id ) {
			return null;
		}
		const rel = path.relative( vite.config.root, resolved.id );
		return rel.startsWith( '..' ) ? '/@fs' + resolved.id : '/' + rel;
	}

	return { cssFor, combined, resolveUrl, stats };
}
