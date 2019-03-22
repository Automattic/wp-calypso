/**
 * External dependencies
 */
const _ = require( 'lodash' );
const path = require( 'path' );

const isCalypsoClient = process.env.CALYPSO_CLIENT === 'true';
const isBrowser = isCalypsoClient || 'true' === process.env.TARGET_BROWSER;

const modules = isBrowser ? false : 'commonjs'; // Use commonjs for Node
const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

// Use target configuration in package.json for browser builds.
const targets = isBrowser ? undefined : { node: 'current' };

const config = {
	babelrcRoots: path.join( __dirname, 'packages', '*' ), // Needed for Jest
	extends: require.resolve( '@automattic/calypso-build/babel.config.js' ),
	presets: [
		[
			'@babel/env',
			{
				modules,
				targets,
				useBuiltIns: 'entry',
				corejs: 2,
				// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
				exclude: [ 'transform-typeof-symbol' ],
			},
		],
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
		isCalypsoClient && './inline-imports.js',
	] ),
	env: {
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
