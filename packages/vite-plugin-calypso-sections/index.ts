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
	const moduleToSectionName = new Map< string, string >();
	let isSSR = false;

	return {
		name: 'calypso-sections',

		configResolved( config: ResolvedConfig ) {
			isSSR = config.build.ssr === true;

			// In SSR mode the server bundle is not code-split by section.
			if ( isSSR ) {
				return;
			}

			const buildConfig = config.build as {
				rolldownOptions?: {
					output?: { manualChunks?: ( id: string ) => string | undefined };
				};
			};
			if ( ! buildConfig.rolldownOptions ) {
				buildConfig.rolldownOptions = {};
			}
			if ( ! buildConfig.rolldownOptions.output ) {
				buildConfig.rolldownOptions.output = {};
			}

			buildConfig.rolldownOptions.output.manualChunks = ( id: string ) => {
				for ( const [ modulePath, sectionName ] of moduleToSectionName ) {
					const clientPath = modulePath.replace( /^calypso\//, 'client/' );
					if ( id.includes( '/' + clientPath ) || id.includes( '/' + clientPath + '/' ) ) {
						return sectionName;
					}
				}
				return undefined;
			};
		},

		transform( code: string, id: string ) {
			const sectionsPath = path.join( root, 'client/sections.js' );
			if ( id !== sectionsPath ) {
				return;
			}

			let sections: Section[] | undefined;
			try {
				const vm = require( 'vm' );
				const esmToCommonJs = code
					.replace( /^export default /, 'module.exports = ' )
					.replace( /^export /gm, '' );

				const ctx = vm.createContext( { module: { exports: null } } );
				vm.runInContext( esmToCommonJs, ctx );

				if ( Array.isArray( ctx.module.exports ) ) {
					sections = ctx.module.exports;
					for ( const section of sections ) {
						if ( section.module && section.name ) {
							moduleToSectionName.set( section.module, section.name );
						}
					}
				}
			} catch ( err: unknown ) {
				const message = err instanceof Error ? err.message : String( err );
				this.warn( `calypso-sections: could not evaluate sections.js: ${ message }` );
			}

			if ( isSSR ) {
				// Match webpack's server sections-loader: only isomorphic sections need
				// server-side load() functions. Keep them synchronous because the server
				// calls section.load().default(...) without await.
				const isomorphicModulePaths = sections
					? new Set(
							sections
								.filter( ( section ) => section.isomorphic && section.module )
								.map( ( section ) => section.module )
					  )
					: null;
				const modulePaths: string[] = [];
				const modified = exportSectionsAsEsm(
					code.replace(
						/\bmodule: (["'])([^"']+)\1/g,
						( _match: string, quote: string, modulePath: string ) => {
							if ( isomorphicModulePaths && ! isomorphicModulePaths.has( modulePath ) ) {
								return _match;
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
