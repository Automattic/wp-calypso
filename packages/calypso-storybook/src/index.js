const path = require( 'path' );
const calypsoBabelConfig = require( '@automattic/calypso-babel-config' );

module.exports = function storybookDefaultConfig( {
	staticDirs = [],
	stories,
	plugins = [],
	webpackAliases = {},
	sassPrelude = '',
	babelCacheDirectory = path.join( __dirname, '../../../.cache/babel-storybook' ),
} = {} ) {
	return {
		framework: {
			name: '@storybook/react-webpack5',
			options: { fastRefresh: true, builder: { lazyCompilation: true } },
		},
		babel: async ( storybookConfig ) => {
			const baseConfig = calypsoBabelConfig();
			return {
				...storybookConfig,
				cacheDirectory: babelCacheDirectory,

				// Reuse presets and plugins from the base Calypso config
				presets: [ ...( storybookConfig.presets ?? [] ), ...( baseConfig.presets ?? [] ) ],
				plugins: [
					...( storybookConfig.plugins ?? [] ),
					...( baseConfig.plugins ?? [] ),

					// Forces some plugins to load in loose mode, used by Storybook.
					// See https://github.com/storybookjs/storybook/issues/14805
					[
						require.resolve( '@babel/plugin-transform-private-property-in-object' ),
						{ loose: true },
					],
					[ require.resolve( '@babel/plugin-proposal-class-properties' ), { loose: true } ],
					[ require.resolve( '@babel/plugin-transform-private-methods' ), { loose: true } ],
				],
			};
		},
		staticDirs,
		stories: stories && stories.length ? stories : [ '../src/**/*.stories.{js,jsx,ts,tsx}' ],
		addons: [
			'@storybook/addon-docs',
			'@storybook/addon-themes',
			'@storybook/addon-webpack5-compiler-babel',
		],
		typescript: {
			check: false,
			reactDocgen: 'react-docgen-typescript',
			reactDocgenTypescriptOptions: {
				shouldExtractLiteralValuesFromEnum: true,
				shouldRemoveUndefinedFromOptional: true,
				savePropValueAsString: true,
				propFilter: ( prop ) => {
					// Always show props declared in `@wordpress/components`
					if (
						prop.declarations?.some( ( d ) => d.fileName.includes( '@wordpress/components' ) )
					) {
						return true;
					}

					// Hide props declared in other `node_modules` (mostly built-in React props)
					if ( prop.declarations?.every( ( d ) => d.fileName.includes( 'node_modules' ) ) ) {
						return false;
					}

					return true;
				},
			},
		},
		webpackFinal: async ( config ) => {
			config.resolve.alias = {
				...config.resolve.alias,
				...webpackAliases,
			};
			// Reuse the style-loader and css-loader that Storybook already applies to `.css`.
			const cssRule = config.module.rules.find(
				( rule ) => String( rule?.test ) === String( /\.css$/ )
			);
			const [ styleLoader, cssLoader ] = cssRule?.use ?? [];
			const loaderPath = ( loader ) => ( typeof loader === 'string' ? loader : loader?.loader );
			if (
				! /[\\/]style-loader[\\/]/.test( loaderPath( styleLoader ) ) ||
				! /[\\/]css-loader[\\/]/.test( loaderPath( cssLoader ) )
			) {
				throw new Error(
					"calypso-storybook: Storybook's .css rule no longer starts with style-loader and css-loader to extend for .scss"
				);
			}
			config.module.rules = [
				...config.module.rules,
				{
					test: /\.scss$/,
					use: [
						styleLoader,
						{
							...cssLoader,
							options: {
								...cssLoader.options,
								// Plain `.css` files imported from SCSS must not go through sass-loader, which
								// would prepend `sassPrelude` to them.
								importLoaders: 0,
								// Components import `*.module.scss` as a default object (`styles.tablist`),
								// which css-loader 7 no longer exports by default. Without `as-is`, it would
								// only export camel-cased keys, and kebab-case lookups like
								// `styles[ 'is-current' ]` would be undefined.
								modules: { auto: true, namedExport: false, exportLocalsConvention: 'as-is' },
							},
						},
						{
							loader: require.resolve( 'sass-loader' ), // Compiles Sass to CSS
							options: {
								additionalData: sassPrelude,
								api: 'modern',
								sassOptions: {
									quietDeps: true,
									silenceDeprecations: [ 'mixed-decls', 'import', 'global-builtin' ],
								},
							},
						},
					],
				},
			];
			config.resolve.mainFields = [ 'browser', 'calypso:src', 'module', 'main' ];
			config.resolve.conditionNames = [ 'calypso:src', 'import', 'module', 'require' ];
			config.plugins.push( ...plugins );
			return config;
		},
	};
};
