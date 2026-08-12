const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

const isDevelopment = process.env.NODE_ENV !== 'production';

class WritingOnlyBoundaryPlugin {
	constructor( entryName ) {
		this.entryName = entryName;
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( 'WritingOnlyBoundaryPlugin', ( compilation ) => {
			compilation.hooks.afterOptimizeChunks.tap( 'WritingOnlyBoundaryPlugin', () => {
				const entrypoint = compilation.entrypoints.get( this.entryName );
				if ( ! entrypoint ) {
					return;
				}

				const chunkGroups = new Set( [ entrypoint ] );
				for ( const group of chunkGroups ) {
					for ( const child of group.getChildren() ) {
						chunkGroups.add( child );
					}
				}
				const modules = new Set();
				for ( const group of chunkGroups ) {
					for ( const chunk of group.chunks ) {
						for ( const module of compilation.chunkGraph.getChunkModulesIterable( chunk ) ) {
							modules.add( module );
						}
					}
				}

				const forbidden = [
					'agents-manager-with-provider',
					'/packages/agents-manager/src/components/agents-manager.tsx',
					'/packages/agents-manager/src/components/agent-dock/',
					'/packages/agents-manager/src/components/button-picker/',
					'/packages/agents-manager/src/components/color-picker/',
					'/packages/agents-manager/src/components/font-picker/',
					'/packages/agents-manager/src/hooks/use-abilities-registration',
					'/packages/agents-manager/src/hooks/custom-actions/index',
					'/packages/agents-manager/src/hooks/use-picker-variations',
					'/packages/agents-manager/src/abilities/',
					'/packages/agents-manager/src/utils/create-agent-config',
					'/packages/agents-manager/src/utils/site-editor-context',
					'/apps/big-sky/',
					'/packages/big-sky/',
				];
				const violations = [ ...modules ]
					.map( ( module ) => module.resource?.replace( /\\/g, '/' ) )
					.filter( ( resource ) => {
						if (
							this.entryName === 'agents-manager-gutenberg-jetpack-ai' &&
							resource?.endsWith( '/components/agent-dock/style.scss' )
						) {
							return false;
						}

						return forbidden.some( ( fragment ) => resource?.includes( fragment ) );
					} );
				if ( violations.length ) {
					compilation.errors.push(
						new webpack.WebpackError(
							`Writing-only bundle ${
								this.entryName
							} crossed its dependency boundary:\n${ violations.join( '\n' ) }`
						)
					);
				}
			} );
		} );
	}
}

class EsmProviderAssetPlugin {
	constructor( filename, dependencies, hostAssetFilename ) {
		this.filename = filename;
		this.dependencies = dependencies;
		this.hostAssetFilename = hostAssetFilename;
	}

	apply( compiler ) {
		compiler.hooks.beforeCompile.tap( 'EsmProviderAssetPlugin', () => {
			// Externals are rediscovered on every incremental build. Do not keep
			// dependencies that a prior watch compilation no longer imports.
			this.dependencies.clear();
		} );

		compiler.hooks.thisCompilation.tap( 'EsmProviderAssetPlugin', ( compilation ) => {
			compilation.hooks.processAssets.tap(
				{
					name: 'EsmProviderAssetPlugin',
					stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
				},
				() => {
					compilation.emitAsset(
						this.filename,
						new webpack.sources.RawSource(
							JSON.stringify( {
								dependencies: [ ...this.dependencies ].sort(),
								version: compilation.hash,
							} )
						)
					);
				}
			);
		} );

		if ( this.hostAssetFilename ) {
			compiler.hooks.afterEmit.tap( 'EsmProviderAssetPlugin', ( compilation ) => {
				const hostAssetPath = path.join( compilation.outputOptions.path, this.hostAssetFilename );
				try {
					const hostAsset = JSON.parse(
						compiler.outputFileSystem.readFileSync( hostAssetPath, 'utf8' )
					);
					const hostDependencies = new Set( hostAsset.dependencies || [] );
					const missingDependencies = [ ...this.dependencies ].filter(
						( dependency ) => ! hostDependencies.has( dependency )
					);
					if ( missingDependencies.length ) {
						compilation.errors.push(
							new webpack.WebpackError(
								`ESM provider runtime dependencies are missing from ${
									this.hostAssetFilename
								}:\n${ missingDependencies.join( '\n' ) }`
							)
						);
					}
				} catch ( error ) {
					compilation.errors.push(
						new webpack.WebpackError(
							`Could not verify ESM provider runtime dependencies against ${ this.hostAssetFilename }: ${ error.message }`
						)
					);
				}
			} );
		}
	}
}

function applyPostCssConfig( rules, config ) {
	return rules.map( ( rule ) => ( {
		...rule,
		use: rule.use?.map( ( loader ) =>
			loader?.loader === require.resolve( 'postcss-loader' )
				? {
						...loader,
						options: {
							...loader.options,
							postcssOptions: {
								...loader.options?.postcssOptions,
								config,
							},
						},
				  }
				: loader
		),
	} ) );
}

function getIndividualConfig( options = {} ) {
	const { name, env, argv, injectPolyfill = true } = options;

	const outputPath = path.join( __dirname, 'dist' );
	// Every entry emits into the shared `dist/`, so chunk files (JS and the
	// CSS the base config derives from this name) must be entry-unique —
	// same-named files from another entry's build would overwrite these. The
	// content hash busts CDN caches: chunk URLs carry no `?ver` query, unlike
	// the entries enqueued via `asset.json`.
	const webpackConfig = getBaseWebpackConfig( env, {
		...argv,
		'output-chunk-filename': `${ name }.[name].[contenthash:8].min.js`,
	} );

	return {
		...webpackConfig,
		name,
		mode: isDevelopment ? 'development' : 'production',
		entry: { [ name ]: path.join( __dirname, name ) },
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].min.js',
			// Entries loaded on the same page (e.g. wp-admin + image-studio)
			// must not share a chunk-loading runtime global.
			chunkLoadingGlobal: `webpackChunk_${ name.replace( /-/g, '_' ) }`,
			uniqueName: name,
			library: 'agentsManager',
		},
		module: {
			...webpackConfig.module,
			rules: [
				...( webpackConfig.module?.rules || [] ),
				// Handle image assets from image-studio package
				{
					test: /\.(webp|png|jpg|jpeg|gif|svg)$/i,
					include: /image-studio/,
					type: 'asset/resource',
					generator: {
						filename: 'images/[name].[contenthash:8][ext]',
					},
				},
			],
		},
		resolve: {
			...webpackConfig.resolve,
			alias: {
				...( webpackConfig.resolve?.alias || {} ),
				// Share one Smooch instance with the Help Center bundle when both load
				// together (e.g. the Site Editor). See smooch-shim.js.
				// TODO: Remove once Agents Manager takes over the Help Center.
				smooch$: path.join( __dirname, '../../build-tools/webpack/smooch-shim.js' ),
			},
		},
		optimization: {
			...webpackConfig.optimization,
			// disable module concatenation so that instances of `__()` are not renamed
			concatenateModules: false,
		},
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'default' ),
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new GenerateChunksMapPlugin( {
				output: path.resolve( `./dist/chunks-map-${ name }.json` ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill,
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
				requestToExternal( request ) {
					// The extraction logic will only extract a package if requestToExternal
					// explicitly returns undefined for the given request. Null
					// shortcuts the logic such that the package will be bundled.
					if ( request === '@wordpress/react-i18n' ) {
						return null;
					}
					// TODO: Remove this override when @wordpress/abilities ships with
					// WordPress core (expected in WP 7.0).
					// Bundle @wordpress/abilities so bundles work on sites where the
					// package isn't registered as a script — WP_Scripts silently skips
					// scripts with unregistered dependencies.
					if ( request === '@wordpress/abilities' ) {
						return null;
					}
					// Bundle @wordpress/ui: neither WordPress core nor the Gutenberg
					// plugin registers a wp-ui script handle yet, and WP_Scripts
					// silently skips scripts with unregistered dependencies, so
					// externalizing it prevents the bundle from loading on
					// self-hosted sites.
					if ( request === '@wordpress/ui' ) {
						return null;
					}
					// The plugin maps `react`/`react-dom` but not this deep import,
					// so it would get bundled — a second react-dom copy (v19) that
					// crashes against the page's external React. WordPress's
					// `ReactDOM` global has included `createRoot` since WP 6.2.
					if ( request === 'react-dom/client' ) {
						return 'ReactDOM';
					}
				},
				requestToHandle( request ) {
					if ( request === 'react-dom/client' ) {
						return 'react-dom';
					}
				},
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
	};
}

function getEsmProviderConfig( options = {} ) {
	const { name, env, argv } = options;
	const webpackConfig = getIndividualConfig( { name, env, argv, injectPolyfill: false } );
	const output = { ...webpackConfig.output };
	delete output.libraryTarget;
	const dependencies = new Set();
	const toWpGlobal = ( packageName ) =>
		packageName.replace( /-([a-z])/g, ( _, letter ) => letter.toUpperCase() );
	const wpPackagesBundledForCompatibility = new Set( [
		'@wordpress/abilities',
		// The writing-only provider is imported at runtime, so these transitive
		// packages cannot rely on its otherwise-unread asset manifest. They are
		// also not safe dependencies on every WordPress version we support.
		'@wordpress/a11y',
		'@wordpress/deprecated',
		'@wordpress/dom-ready',
		'@wordpress/hooks',
		'@wordpress/icons',
		'@wordpress/private-apis',
		'@wordpress/react-i18n',
		'@wordpress/theme',
		'@wordpress/ui',
		'@wordpress/warning',
	] );
	const externalizeScriptGlobal = ( { request }, callback ) => {
		if ( request === 'react' ) {
			dependencies.add( 'react' );
			return callback( null, [ 'React' ] );
		}
		if ( request === 'react-dom' || request === 'react-dom/client' ) {
			dependencies.add( 'react-dom' );
			return callback( null, [ 'ReactDOM' ] );
		}
		if (
			request?.startsWith( '@wordpress/' ) &&
			! wpPackagesBundledForCompatibility.has( request )
		) {
			const packageName = request.slice( '@wordpress/'.length );
			dependencies.add( `wp-${ packageName }` );
			return callback( null, [ 'wp', toWpGlobal( packageName ) ] );
		}
		return callback();
	};

	return {
		...webpackConfig,
		externals: [ ...( webpackConfig.externals || [] ), externalizeScriptGlobal ],
		externalsType: 'window',
		experiments: {
			...( webpackConfig.experiments || {} ),
			outputModule: true,
		},
		output: {
			...output,
			filename: '[name].mjs',
			chunkFilename: `${ name }.[name].[contenthash:8].mjs`,
			library: { type: 'module' },
			module: true,
			chunkFormat: 'module',
			chunkLoading: 'import',
		},
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new EsmProviderAssetPlugin(
				`${ name }.asset.json`,
				dependencies,
				name === 'jetpack-ai-sidebar-limited.provider'
					? 'agents-manager-gutenberg-jetpack-ai.asset.json'
					: undefined
			),
		],
	};
}

/**
 * Reader chat config — bundles all dependencies and emits an asset manifest.
 *
 * DependencyExtractionWebpackPlugin is configured with useDefaults: false so React,
 * WordPress data, and other WP packages remain inlined. The resulting reader-chat.min.js
 * is self-contained and safe to load on the frontend.
 * @param   {Object}  options                       options
 * @param   {Object}  options.env                   environment options
 * @param   {Object}  options.argv                  webpack CLI args
 * @returns {Object}                                webpack config
 */
function getReaderConfig( options = {} ) {
	const { env, argv } = options;
	const outputPath = path.join( __dirname, 'dist' );
	// Chunk files must be entry-unique and content-hashed in the shared
	// `dist/` — see `getIndividualConfig`.
	const webpackConfig = getBaseWebpackConfig( env, {
		...argv,
		'output-chunk-filename': 'reader-chat.[name].[contenthash:8].min.js',
	} );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: { 'reader-chat': path.join( __dirname, 'reader-chat.js' ) },
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].min.js',
			chunkLoadingGlobal: 'webpackChunkJetpackReaderChat',
			uniqueName: 'JetpackReaderChat',
		},
		module: {
			...webpackConfig.module,
			rules: [
				...applyPostCssConfig(
					webpackConfig.module?.rules || [],
					path.join( __dirname, 'reader-chat-postcss.config.js' )
				),
				{
					// P2/O2 expects window._ to remain Underscore.
					resource: require.resolve( 'lodash/lodash.js' ),
					use: path.join( __dirname, 'disable-lodash-amd-loader.js' ),
				},
			],
		},
		resolve: {
			...webpackConfig.resolve,
			alias: {
				...( webpackConfig.resolve?.alias || {} ),
				// Share one Smooch instance across bundles (see smooch-shim.js).
				// TODO: Remove once Agents Manager takes over the Help Center.
				smooch$: path.join( __dirname, '../../build-tools/webpack/smooch-shim.js' ),
				// Keep libvips' inlined WASM out of the frontend bundle. See
				// reader-chat-vips-stub.js.
				'@wordpress/vips/worker$': path.join( __dirname, 'reader-chat-vips-stub.js' ),
				'../agent-history': path.join( __dirname, 'reader-chat-route-stub.js' ),
				'../support-guide': path.join( __dirname, 'reader-chat-route-stub.js' ),
				'../support-guides': path.join( __dirname, 'reader-chat-route-stub.js' ),
				'../zendesk-chat': path.join( __dirname, 'reader-chat-route-stub.js' ),
			},
		},
		optimization: {
			...webpackConfig.optimization,
			// Disable module concatenation so __() calls are not renamed.
			concatenateModules: false,
		},
		plugins: [
			// Strip the base config's DependencyExtractionWebpackPlugin — we want
			// everything bundled, not externalized.
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'default' ),
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new ReadableJsAssetsWebpackPlugin(),
			// Emit the cache-busting manifest without externalizing any dependencies.
			new DependencyExtractionWebpackPlugin( {
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
				useDefaults: false,
			} ),
		],
	};
}

/* Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 * @param   {Object}  env                           environment options
 * @param   {string}  env.source                    plugin slugs, comma separated list
 * @param   {Object}  argv                          options map
 * @param   {string}  argv.entry                    entry path
 * @returns {Object}                                webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;

	// Copy the ESM provider wrapper for jetpack-ai-sidebar to dist.
	// This file is pure ESM and doesn't need webpack processing — AM
	// loads it via dynamic import() at runtime.
	const copyEsmProviders = new CopyPlugin( {
		patterns: [
			{
				from: path.join( __dirname, 'jetpack-ai-sidebar.provider.mjs' ),
				to: path.join( __dirname, 'dist', 'jetpack-ai-sidebar.provider.mjs' ),
			},
		],
	} );

	const configs = [
		getIndividualConfig( { env, argv, name: 'agents-manager-gutenberg' } ),
		( () => {
			const config = getIndividualConfig( {
				env,
				argv,
				name: 'agents-manager-gutenberg-jetpack-ai',
			} );
			config.plugins.push( new WritingOnlyBoundaryPlugin( 'agents-manager-gutenberg-jetpack-ai' ) );
			return config;
		} )(),
		getIndividualConfig( { env, argv, name: 'agents-manager-wp-admin' } ),
		getIndividualConfig( { env, argv, name: 'image-studio' } ),
		getIndividualConfig( { env, argv, name: 'jetpack-ai-sidebar' } ),
		( () => {
			const config = getEsmProviderConfig( {
				env,
				argv,
				name: 'jetpack-ai-sidebar-limited.provider',
			} );
			config.plugins.push( new WritingOnlyBoundaryPlugin( 'jetpack-ai-sidebar-limited.provider' ) );
			// The provider verifies its externals against the shell's emitted asset
			// manifest, so Webpack must finish the shell compiler first.
			config.dependencies = [ 'agents-manager-gutenberg-jetpack-ai' ];
			return config;
		} )(),
		getIndividualConfig( { env, argv, name: 'agents-manager-gutenberg-disconnected' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-wp-admin-disconnected' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-ciab' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-wooai' } ),
		getReaderConfig( { env, argv } ),
	];

	// Attach the copy plugin to the first config.
	configs[ 0 ].plugins.push( copyEsmProviders );

	return configs;
}

module.exports = getWebpackConfig;
