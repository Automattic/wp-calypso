/** @format */
/**
 * External dependencies
 */
const _ = require( 'lodash' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const config = require( './server/config' );

/**
 * Internal variables
 */
const bundleEnv = config( 'env' );
const cssModules = process.env.CSS_MODULES === 'true';
const cssModulesLocalIdentName =
	bundleEnv !== 'production' ? '[name]__[local]___[hash:base64:5]' : '[hash:base64:5]';
const isCalypsoClient = process.env.CALYPSO_CLIENT === 'true';
const isCalypsoServer = process.env.CALYPSO_SERVER === 'true';
const isCalypso = isCalypsoClient || isCalypsoServer;
const modules = isCalypsoClient ? false : 'commonjs'; // only calypso should keep es6 modules
const codeSplit = config.isEnabled( 'code-splitting' );

const babelConfig = {
	presets: [
		[
			'@babel/env',
			{
				modules,
				targets: {
					browsers: [ 'last 2 versions', 'Safari >= 10', 'iOS >= 10', 'ie >= 11' ],
				},
				exclude: [ 'transform-classes', 'transform-template-literals' ], // transform-classes is added manually later.
				useBuiltIns: 'entry',
				shippedProposals: true, // allows es7 features like Promise.prototype.finally
			},
		],
		'@babel/react',
	],
	plugins: _.compact( [
		// the two class transforms are to emulate exactly how babel 6 handled classes.
		// it very slightly diverges from spec but also is more concise.
		// see: http://new.babeljs.io/docs/en/next/v7-migration.html#babel-plugin-proposal-class-properties
		[ '@babel/plugin-proposal-class-properties', { loose: true } ],
		[ '@babel/plugin-transform-classes', { loose: false } ],
		[ '@babel/plugin-transform-template-literals', { loose: true } ],
		isCalypso && [
			path.join(
				__dirname,
				'server',
				'bundler',
				'babel',
				'babel-plugin-transform-wpcalypso-async'
			),
			{ async: isCalypsoClient && codeSplit },
		],
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
		cssModules && [
			path.join(
				__dirname,
				'server',
				'bundler',
				'babel',
				'babel-plugin-transform-rename-attribute'
			),
			{
				from: 'className',
				to: 'styleName',
			},
		],
		cssModules && [
			'babel-plugin-react-css-modules',
			{
				context: __dirname,
				filetypes: {
					'.scss': {
						syntax: 'postcss-scss',
					},
				},
				generateScopedName: cssModulesLocalIdentName,
			},
		],
	] ),
	env: {
		test: {
			presets: [ [ '@babel/env', { targets: { node: 'current' } } ] ],
			plugins: [ 'add-module-exports', './server/bundler/babel/babel-lodash-es' ],
		},
	},
};

module.exports = babelConfig;
