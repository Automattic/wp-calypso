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

			if ( isSSR ) {
				// For SSR, use static imports so section.load() returns the module
				// namespace synchronously. The server calls section.load().default(...)
				// without await, so async dynamic import() would break it.
				const modulePaths: string[] = [];
				const modified = code.replace(
					/\bmodule: (["'])([^"']+)\1/g,
					( _match: string, quote: string, modulePath: string ) => {
						let varIdx = modulePaths.indexOf( modulePath );
						if ( varIdx === -1 ) {
							varIdx = modulePaths.push( modulePath ) - 1;
						}
						return `module: ${ quote }${ modulePath }${ quote }, load: () => _sectionMod${ varIdx }`;
					}
				);

				const imports = modulePaths
					.map( ( m, i ) => `import * as _sectionMod${ i } from ${ JSON.stringify( m ) };` )
					.join( '\n' );

				return { code: imports + '\n' + modified, map: null };
			}

			// Match module paths in both single and double quotes, since a pre-transform
			// plugin (e.g. calypso-transform-jsx-in-js via OXC) may normalise quote style.
			const modified = code.replace(
				/\bmodule: (["'])([^"']+)\1/g,
				( _match: string, quote: string, modulePath: string ) =>
					`module: ${ quote }${ modulePath }${ quote }, load: () => import( '${ modulePath }' )`
			);

			return { code: modified, map: null };
		},
	};
}
