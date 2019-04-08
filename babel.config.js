/**
 * External dependencies
 */
const _ = require( 'lodash' );
const path = require( 'path' );

const isBrowser = process.env.BROWSERSLIST_ENV !== 'server';

const modules = isBrowser ? false : 'commonjs'; // Use commonjs for Node
const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

// We implicitly use browserslist configuration in package.json for build targets.

const config = {
	extends: require.resolve( '@automattic/calypso-build/babel.config.js' ),
	presets: [
		[
			'@babel/env',
			{
				modules,
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
			{ async: isBrowser && codeSplit },
		],
		isBrowser && './inline-imports.js',
	] ),
	env: {
		build_pot: {
			plugins: [
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
