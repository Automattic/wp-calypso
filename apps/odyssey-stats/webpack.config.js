const path = require( 'path' );
const process = require( 'process' ); // eslint-disable-line
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const Minify = require( '@automattic/calypso-build/webpack/minify' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const { shouldTranspileDependency } = require( '@automattic/calypso-build/webpack/util' );
const ExtensiveLodashReplacementPlugin = require( '@automattic/webpack-extensive-lodash-replacement-plugin' );
const InlineConstantExportsPlugin = require( '@automattic/webpack-inline-constant-exports-plugin' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const {
	defaultRequestToExternal,
	defaultRequestToHandle,
} = require( '@wordpress/dependency-extraction-webpack-plugin/lib/util' );
const autoprefixerPlugin = require( 'autoprefixer' );
const prefixSelectorPlugin = require( 'postcss-prefix-selector' );
const webpack = require( 'webpack' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const cacheIdentifier = require( '../../build-tools/babel/babel-loader-cache-identifier' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
const isDevelopment = process.env.NODE_ENV !== 'production';
const outBasePath = process.env.STATS_PACKAGE_PATH ? process.env.STATS_PACKAGE_PATH : __dirname;
const outputPath = path.join( outBasePath, 'dist' );
const sourceMap = isDevelopment ? 'source-map' : false;

const defaultBrowserslistEnv = 'evergreen';
const browserslistEnv = process.env.BROWSERSLIST_ENV || defaultBrowserslistEnv;
const extraPath = browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv;
const cachePath = path.resolve( '.cache', extraPath );

const excludedPackages = [
	/^calypso\/my-sites\/stats\/mini-carousel.*$/,
	/^calypso\/blocks\/jetpack-backup-creds-banner.*$/,
	/^calypso\/components\/data\/query-keyring-connections$/,
	/^calypso\/components\/data\/query-jetpack-modules$/,
	/^calypso\/components\/data\/query-site-keyrings$/,
	/^calypso\/components\/data\/query-preferences$/,
];

const excludedPackagePlugins = excludedPackages.map(
	// Note: apparently the word "package" is a reserved keyword here for some reason
	( pkg ) =>
		new webpack.NormalModuleReplacementPlugin(
			pkg,
			path.resolve( __dirname, 'src/components/nothing' )
		)
);

module.exports = {
	bail: ! isDevelopment,
	entry: {
		build: path.join( __dirname, 'src', 'app' ),
		'widget-loader': path.join( __dirname, 'src', 'widget-loader' ),
	},
	mode: isDevelopment ? 'development' : 'production',
	devtool: sourceMap,
	output: {
		path: outputPath,
		filename: '[name].min.js',
		chunkFilename: '[name]-[contenthash].js?minify=false',
	},
	optimization: {
		minimize: ! isDevelopment,
		concatenateModules: ! shouldEmitStats,
		minimizer: Minify(),
		splitChunks: false,
	},
	module: {
		strictExportPresence: true,
		rules: [
			// Disable `resolve.fullySpecified` for .mjs and .js files. Some
			// dependencies ship .mjs that imports bare paths like
			// `fast-deep-equal/es6`, which webpack would otherwise reject as
			// not fully specified.
			{
				test: /\.m?js$/,
				resolve: { fullySpecified: false },
			},
			TranspileConfig.loader( {
				workerCount: 2,
				configFile: path.resolve( '../../babel.config.js' ),
				cacheDirectory: path.resolve( cachePath, 'babel-client' ),
				cacheIdentifier,
				cacheCompression: false,
				exclude: /node_modules\//,
			} ),
			TranspileConfig.loader( {
				workerCount: 2,
				presets: [ require.resolve( '@automattic/calypso-babel-config/presets/dependencies' ) ],
				cacheDirectory: path.resolve( cachePath, 'babel-client' ),
				cacheIdentifier,
				cacheCompression: false,
				include: shouldTranspileDependency,
			} ),
			SassConfig.loader( {
				postCssOptions: {
					// Do not use postcss.config.js. This ensure we have the final say on how PostCSS is used in calypso.
					// This is required because Calypso imports `@automattic/notifications` and that package defines its
					// own `postcss.config.js` that they use for their webpack bundling process.
					config: false,
					plugins: [
						// Scopes every selector compiled from this repo's own Stats/Calypso
						// component stylesheets to `#wpcom` (the app's own mount point), so generic
						// classes shared across hundreds of components (`.card`, `.button`, `.notice`,
						// etc.) can't collide with wp-admin's own chrome or other plugins' admin
						// pages. Deliberately scoped to first-party code only — see `ignoreFiles`.
						prefixSelectorPlugin( {
							// `.color-scheme`/`.ReactModalPortal` cover the older Popover (`RootChild`)
							// and Dialog (`react-modal`) portal roots. `[data-base-ui-portal]` and
							// `[data-wp-compat-overlay-slot]` cover the newer `@wordpress/ui` floating
							// components (`Popover`, `Tooltip`, `Dialog` — used by e.g. `StatsInfotip`,
							// a first-party component), which are built on Base UI/Floating UI and
							// portal straight to `<body>` with one of those two attributes as their
							// only stable marker — verified against their source (`@base-ui/react` and
							// `@wordpress/ui`'s `wp-compat-overlay-slot`), since neither renders inside
							// `#wpcom` and neither carries a fixed class name.
							prefix:
								':where(#wpcom, .color-scheme, .ReactModalPortal, [data-base-ui-portal], [data-wp-compat-overlay-slot])',
							ignoreFiles: [
								// Already hand-scopes its own selectors (some deliberately target real
								// wp-admin elements like `body.wp-admin #wpcontent`) — running this over
								// it again would double-nest and break those.
								'odyssey-stats/src/app.scss',
								// Calypso's global stylesheet (typography/reset/color-schemes/RTL
								// defaults applied to `html`, `body`, etc., plus the `@wordpress/components`
								// build CSS it pulls in) is left as-is for now, not part of this pass.
								'client/assets/stylesheets/style.scss',
								// Third-party package CSS (charts, `@wordpress/components`, etc.) is out
								// of scope here — only this repo's own component stylesheets are scoped.
								/node_modules/,
							],
							// A handful of rules intentionally target the real `<html>`/`<body>`
							// directly: RTL flags (`.rtl`, `[dir=rtl]`), `:lang()`/`[lang*=…]`
							// language-based font overrides, and dark-mode `:root`/`:root[data-theme=…]`
							// selectors — either from Reader components bundled in transitively, or
							// (for `[lang*=…]`) from `@automattic/typography`'s font mixin, which
							// first-party files `@import` directly, so its rules get compiled straight
							// into those files rather than staying inside `node_modules` where the
							// `ignoreFiles` entry above would otherwise catch them. All of these assume
							// their target can appear anywhere in the document, not just under #wpcom.
							// Prefixing them would require `:root`/`html`/`body` to be a descendant of
							// `#wpcom`, which can never happen — the rule would just go dead. Leave
							// them untouched instead; they stay unscoped, same as before this change.
							exclude: [
								/^:root(?![\w-])/,
								/(^|[\s,])(html|body)(?=$|[\s.[:#,])/,
								/^\.rtl(?![\w-])/,
								/^:lang\(/,
								/^\[lang/,
								/^\[dir[~|^$*]?=/,
							],
						} ),
						autoprefixerPlugin(),
					],
				},
			} ),
			FileConfig.loader(),
			{
				test: /.*config\/production\.json$/,
				use: { loader: './filter-json-config-loader', options: { keys: [ 'features' ] } },
			},
		],
	},
	resolve: {
		extensions: [ '.json', '.js', '.mjs', '.jsx', '.ts', '.tsx' ],
		mainFields: [ 'browser', 'calypso:src', 'module', 'main' ],
		conditionNames: [ 'calypso:src', 'import', 'module', 'require' ],
		alias: {
			// Resolve fast-deep-equal/es6 to fast-deep-equal/es6/index.js.
			'fast-deep-equal/es6': 'fast-deep-equal/es6/index.js',
		},
	},
	node: false,
	plugins: [
		new webpack.DefinePlugin( {
			global: 'window',
			'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
		} ),
		...SassConfig.plugins( {
			filename: '[name].min.css',
			chunkFilename: '[contenthash].css',
			minify: ! isDevelopment,
		} ),
		new DependencyExtractionWebpackPlugin( {
			injectPolyfill: true,
			useDefaults: false,
			requestToHandle: ( request ) => {
				if ( request === 'react-dom/client' ) {
					return 'wp-element';
				}

				return defaultRequestToHandle( request );
			},
			requestToExternal: ( request ) => {
				if ( request === 'react-dom/client' ) {
					return [ 'wp', 'element' ];
				}

				if (
					! [
						'lodash',
						'lodash-es',
						'react',
						'react-dom',
						// Externalize the JSX runtime alongside react/react-dom so it matches the
						// React that WordPress provides. Bundling it (the default here, since it is
						// absent from this allow list) ships an older React's runtime, whose elements
						// React 19 rejects ("A React Element from an older version of React was rendered").
						'react/jsx-runtime',
						'react/jsx-dev-runtime',
						'@wordpress/api-fetch',
						'@wordpress/components',
						'@wordpress/compose',
						'@wordpress/element',
						'@wordpress/html-entities',
						'@wordpress/i18n',
						'@wordpress/is-shallow-equal',
						'@wordpress/polyfill',
						'@wordpress/primitives',
						'@wordpress/url',
						'@wordpress/warning',
						'moment',
						'../moment',
					].includes( request )
				) {
					return;
				}
				// moment locales requires moment.js main file, so we need to handle it as an external as well.
				if ( request === '../moment' ) {
					request = 'moment';
				}
				return defaultRequestToExternal( request );
			},
		} ),
		! isDevelopment &&
			new GenerateChunksMapPlugin( {
				output: path.resolve( outBasePath, 'dist/chunks-map.json' ),
				base_dir: '../../',
			} ),
		/*
		 * ExPlat: Don't import the server logger when we are in the browser
		 */
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/server\/lib\/logger$/,
			'calypso/lib/explat/internals/logger-browser-replacement'
		),
		new webpack.IgnorePlugin( { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ } ),
		new ExtensiveLodashReplacementPlugin(),
		new InlineConstantExportsPlugin( /\/client\/state\/action-types.[tj]s$/ ),
		new InlineConstantExportsPlugin( /\/client\/state\/themes\/action-types.[tj]s$/ ),
		new webpack.NormalModuleReplacementPlugin( /^path$/, 'path-browserify' ),
		// Repalce the `packages/components/src/gridicon/index.tsx` with a replacement that does not enqueue the SVG sprite.
		// The sprite is loaded separately in Jetpack.
		new webpack.NormalModuleReplacementPlugin( /^\.\.\/gridicon$/, '../gridicon/no-asset' ),
		new webpack.NormalModuleReplacementPlugin( /^\.\/gridicon$/, './gridicon/no-asset' ),
		new webpack.NormalModuleReplacementPlugin(
			/^@automattic\/calypso-config$/,
			path.resolve( __dirname, 'src/lib/config-api' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/formatted-header$/,
			( resource ) => {
				// Only replace for the navigation-header context
				if ( resource.context.includes( 'components/navigation-header' ) ) {
					resource.request = resource.request.replace(
						/^calypso\/components\/formatted-header$/,
						path.resolve( __dirname, 'src/components/odyssey-formatted-header' )
					);
				}
			}
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/data\/query-site-purchases$/,
			path.resolve( __dirname, 'src/components/odyssey-query-site-purchases' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/data\/query-sites$/,
			path.resolve( __dirname, 'src/components/odyssey-query-sites' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/data\/query-products-list$/,
			path.resolve( __dirname, 'src/components/odyssey-query-products' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/components\/data\/query-memberships$/,
			path.resolve( __dirname, 'src/components/odyssey-query-memberships' )
		),
		new webpack.NormalModuleReplacementPlugin(
			/^..\/root-child$/,
			path.resolve( __dirname, 'src/components/root-child' )
		),
		...excludedPackagePlugins,
		shouldEmitStats &&
			new BundleAnalyzerPlugin( {
				analyzerMode: 'server',
				statsOptions: {
					source: false,
					reasons: false,
					optimizationBailout: false,
					chunkOrigins: false,
					chunkGroups: true,
				},
			} ),
	].filter( Boolean ),
};
