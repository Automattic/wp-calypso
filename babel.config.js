/** @format */
const _ = require( 'lodash' );
const path = require( 'path' );

const isCalypsoClient = process.env.CALYPSO_CLIENT === 'true';
const isBrowser = isCalypsoClient || 'true' === process.env.TARGET_BROWSER;
const outputDir = process.env.CALYPSO_SDK_OUTPUT_DIR || false;

const modules = isBrowser ? false : 'commonjs'; // Use commonjs for Node
const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

const targets = isBrowser
	? { browsers: [ 'last 2 versions', 'Safari >= 10', 'iOS >= 10', 'ie >= 11' ] }
	: { node: 'current' };

const extensionOverrides = [
	[
		'@wordpress/import-jsx-pragma',
		{
			scopeVariable: 'createElement',
			source: '@wordpress/element',
			isDefault: false,
		},
	],
	[
		'@babel/transform-react-jsx',
		{
			pragma: 'createElement',
		},
	],
];

// The output directory is set when SDK runs, so we only set the POT generator override in that case.
if ( outputDir ) {
	extensionOverrides.unshift( [
		'@wordpress/babel-plugin-makepot',
		{
			output: path.join( outputDir, 'extensions.pot' ),
			headers: {
				'content-type': 'text/plain; charset=UTF-8',
				'x-generator': 'calypso',
				'plural-forms': 'nplurals=2; plural=n == 1 ? 0 : 1;',
			},
		},
	] );
}

const config = {
	presets: [
		[
			'@babel/env',
			{
				modules,
				targets,
				useBuiltIns: 'entry',
				shippedProposals: true, // allows es7 features like Promise.prototype.finally
			},
		],
		'@babel/react',
	],
	plugins: _.compact( [
		[
			path.join(
				__dirname,
				'server',
				'bundler',
				'babel',
				'babel-plugin-transform-wpcalypso-async'
			),
			{ async: isCalypsoClient && codeSplit },
		],
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-export-default-from',
		'@babel/plugin-proposal-export-namespace-from',
		'@babel/plugin-syntax-dynamic-import',
		[
			'@babel/transform-runtime',
			{
				corejs: false, // we polyfill so we don't need core-js
				helpers: true,
				regenerator: false,
				useESModules: false,
			},
		],
		isCalypsoClient && './inline-imports.js',
	] ),
	overrides: [
		{
			test: './client/gutenberg/extensions',
			plugins: extensionOverrides,
		},
	],
	env: {
		build_pot: {
			plugins: [
				[
					'@wordpress/babel-plugin-makepot',
					{
						output: 'build/i18n-calypso/gutenberg-strings.pot',
						headers: {
							'content-type': 'text/plain; charset=UTF-8',
							'x-generator': 'calypso',
						},
					},
				],
				[
					'@automattic/babel-plugin-i18n-calypso',
					{
						dir: 'build/i18n-calypso/',
						headers: {
							'content-type': 'text/plain; charset=UTF-8',
							'x-generator': 'calypso',
						},
					},
				],
			],
		},
		test: {
			presets: [ [ '@babel/env', { targets: { node: 'current' } } ] ],
			plugins: [
				'add-module-exports',
				'babel-plugin-dynamic-import-node',
				'./server/bundler/babel/babel-lodash-es',
			],
		},
	},
};

module.exports = config;
