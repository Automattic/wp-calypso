import { createRequire } from 'module';
import path from 'path';
import type { Plugin, ResolvedConfig } from 'vite';

const require = createRequire( import.meta.url );

interface Section {
	name: string;
	module: string;
	isomorphic?: boolean;
}

function exportSectionsAsEsm( code: string ): string {
	return code.replace( /module\.exports\s*=\s*sections;\s*$/, 'export default sections;\n' );
}

export function vitePluginSections( { root }: { root: string } ): Plugin {
	const sectionsPath = path.resolve( root, 'client/sections.js' );

	let sections: Section[] = [];
	// Sorted longest-prefix-first so the most specific section wins for nested
	// modules like `calypso/a8c-for-agencies` vs `.../sections/landing`.
	let sectionPrefixes: { prefix: string; name: string }[] = [];

	let isSSR = false;

	return {
		name: 'calypso-sections',

		buildStart() {
			try {
				// Drop any cached copy so watch-mode picks up edits.
				delete require.cache[ sectionsPath ];
				const loaded = require( sectionsPath );
				if ( ! Array.isArray( loaded ) ) {
					throw new Error( `expected array export, got ${ typeof loaded }` );
				}
				sections = loaded;
				sectionPrefixes = sections
					.filter( ( s ) => s.module && s.name )
					.map( ( s ) => ( {
						prefix: path.resolve( root, s.module.replace( /^calypso\//, 'client/' ) ) + '/',
						name: s.name,
					} ) )
					.sort( ( a, b ) => b.prefix.length - a.prefix.length );
			} catch ( err: unknown ) {
				const message = err instanceof Error ? err.message : String( err );
				this.warn( `calypso-sections: could not load sections.js: ${ message }` );
			}
		},

		configResolved( config: ResolvedConfig ) {
			isSSR = config.build.ssr === true;

			// manualChunks isn't needed for SSR (the server bundle isn't code-split
			// by section). The transform hook below still runs to inject load() for
			// isomorphic sections.
			if ( isSSR ) {
				return;
			}

			if ( ! config.build.rolldownOptions ) {
				config.build.rolldownOptions = {};
			}
			if ( ! config.build.rolldownOptions.output ) {
				config.build.rolldownOptions.output = [];
			} else if ( ! Array.isArray( config.build.rolldownOptions.output ) ) {
				config.build.rolldownOptions.output = [ config.build.rolldownOptions.output ];
			}

			config.build.rolldownOptions.output.push( {
				manualChunks( id: string ) {
					for ( const { prefix, name } of sectionPrefixes ) {
						if ( id.startsWith( prefix ) ) {
							return name;
						}
					}
					return undefined;
				},
			} );
		},

		transform( code: string, id: string ) {
			if ( id !== sectionsPath ) {
				return;
			}

			if ( isSSR ) {
				// Match webpack's server sections-loader: only isomorphic sections need
				// server-side load() functions. Keep them synchronous because the server
				// calls section.load().default(...) without await.
				const isomorphic = new Set(
					sections.filter( ( s ) => s.isomorphic && s.module ).map( ( s ) => s.module )
				);
				const modulePaths: string[] = [];
				const modified = exportSectionsAsEsm(
					code.replace(
						/\bmodule: (["'])([^"']+)\1/g,
						( match: string, quote: string, modulePath: string ) => {
							if ( ! isomorphic.has( modulePath ) ) {
								return match;
							}
							let varIdx = modulePaths.indexOf( modulePath );
							if ( varIdx === -1 ) {
								varIdx = modulePaths.push( modulePath ) - 1;
							}
							return `module: ${ quote }${ modulePath }${ quote }, load: () => _sectionMod${ varIdx }`;
						}
					)
				);

				const imports = modulePaths
					.map( ( m, i ) => `import * as _sectionMod${ i } from ${ JSON.stringify( m ) };` )
					.join( '\n' );

				return { code: imports + '\n' + modified, map: null };
			}

			// Match module paths in both single and double quotes, since a pre-transform
			// plugin (e.g. calypso-transform-jsx-in-js via OXC) may normalise quote style.
			const modified = exportSectionsAsEsm(
				code.replace(
					/\bmodule: (["'])([^"']+)\1/g,
					( _match: string, quote: string, modulePath: string ) =>
						`module: ${ quote }${ modulePath }${ quote }, load: () => import( '${ modulePath }' )`
				)
			);

			return { code: modified, map: null };
		},
	};
}
