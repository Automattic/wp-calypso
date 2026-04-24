import { createRequire } from 'module';
import path from 'path';
import type { Plugin, ResolvedConfig } from 'vite';

const require = createRequire( import.meta.url );

interface Section {
	name: string;
	module: string;
}

export function vitePluginSections( { root }: { root: string } ): Plugin {
	const moduleToSectionName = new Map< string, string >();

	return {
		name: 'calypso-sections',

		transform( code: string, id: string ) {
			const sectionsPath = path.join( root, 'client/sections.js' );
			if ( id !== sectionsPath ) {
				return;
			}

			try {
				const vm = require( 'vm' );
				const esmToCommonJs = code
					.replace( /^export default /, 'module.exports = ' )
					.replace( /^export /gm, '' );

				const ctx = vm.createContext( { module: { exports: null } } );
				vm.runInContext( esmToCommonJs, ctx );

				const sections: Section[] = ctx.module.exports;
				if ( Array.isArray( sections ) ) {
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

			const modified = code.replace(
				/\bmodule: '([^']+)'/g,
				( _match: string, modulePath: string ) =>
					`module: '${ modulePath }', load: () => import( '${ modulePath }' )`
			);

			return { code: modified, map: null };
		},

		configResolved( config: ResolvedConfig ) {
			// In SSR mode the server bundle is not code-split by section.
			if ( config.build.ssr ) {
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
	};
}
