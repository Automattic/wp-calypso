import { resolve, basename, dirname } from 'node:path';
import getBaseWebpackConfig from '@automattic/calypso-build/webpack.config.js';
import glob from 'glob';

const parent = ( path ) => basename( dirname( path ) );

const components = glob.sync( 'src/*/style.module.scss' ).map( parent );
const capitalize = ( str ) => str.replace( /(?:^|-)([a-z])/g, ( _, c ) => c.toUpperCase() );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return /** @type {import('webpack').Configuration} */ ( {
		...webpackConfig,
		devtool: false,
		context: resolve( import.meta.dirname, 'src' ),
		entry: Object.fromEntries(
			components.map( ( component ) => [ component, `./${ component }/index.tsx` ] )
		),
		experiments: {
			outputModule: true,
		},
		output: {
			path: resolve( import.meta.dirname, 'dist' ),
			filename: '[name].js',
			library: {
				type: 'module',
			},
			clean: true,
		},
		externals: function ( { request }, callback ) {
			if ( request.startsWith( '.' ) ) {
				return callback( null, false );
			}

			if ( request.startsWith( '/' ) ) {
				return callback( null, false );
			}

			return callback( null, `module ${ request }` );
		},
		plugins: [
			...webpackConfig.plugins,
			new ( class EmitIndexPlugin {
				apply( compiler ) {
					compiler.hooks.thisCompilation.tap( 'EmitIndexPlugin', ( compilation ) => {
						compilation.hooks.processAssets.tap(
							{
								name: 'EmitIndexPlugin',
								stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
							},
							() => {
								const content = components
									.map(
										( component ) =>
											`export { default as ${ capitalize(
												component
											) } } from './${ component }.js';`
									)
									.join( '\n' );

								const { RawSource } = compiler.webpack.sources;
								compilation.emitAsset( 'index.js', new RawSource( content ) );
							}
						);
					} );
				}
			} )(),
		],
	} );
}

export default getWebpackConfig;
