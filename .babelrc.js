/** @format */
const _ = require( 'lodash' );
const path = require( 'path' );

const isCalypsoClient = process.env.CALYPSO_CLIENT === 'true';
const isCalypsoServer = process.env.CALYPSO_SERVER === 'true';
const isCalypso = isCalypsoClient || isCalypsoServer;
const isTest = process.env.NODE_ENV === 'test';

const modules = isCalypsoClient ? false : 'commonjs'; // only calypso should keep es6 modules
const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

const config = {
	presets: [
		[
			'@babel/env',
			{
				modules,
				targets: {
					browsers: [ 'last 2 versions', 'Safari >= 10', 'iOS >= 10', 'not ie <= 10' ],
				},
			},
		],
		'@babel/stage-2',
		'@babel/react',
	],
	plugins: _.compact( [
		! isCalypso && 'add-module-exports',
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
		// @todo: re-evaluate inline-imports.js
		// isCalypsoClient && './inline-imports.js',
		'@babel/plugin-proposal-export-default-from',
		'@babel/plugin-proposal-export-namespace-from',
		'@babel/transform-runtime',
		[
			'transform-imports',
			{
				'state/selectors': {
					transform: 'state/selectors/${member}',
					kebabCase: true,
				},
			},
		],
	] ),
	env: {
		test: {
			plugins: _.compact( [
				isTest && './server/bundler/babel/babel-lodash-es',
				[ 'transform-builtin-extend', { globals: [ 'Error' ] } ],
			] ),
		},
	},
};

module.exports = config;
