/** @format */
const _ = require( 'lodash' );
const path = require( 'path' );

const isCalypsoClient = process.env.CALYPSO_CLIENT === 'true';
const isCalypsoServer = process.env.CALYPSO_SERVER === 'true';
const isCalypso = isCalypsoClient || isCalypsoServer;

const modules = isCalypsoClient ? false : 'commonjs'; // only calypso should keep es6 modules
const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

const config = {
	presets: [
		[
			'@babel/env',
			{
				modules,
				targets: {
					browsers: [ 'last 4 Chrome versions' ],
				},
				exclude: [ 'transform-classes', 'transform-template-literals' ], // transform-classes is added manually later.
				useBuiltIns: 'usage',
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
		'@babel/plugin-proposal-export-default-from',
		isCalypsoClient && './inline-imports.js',
	] ),
	env: {
		test: {
			plugins: [ './server/bundler/babel/babel-lodash-es' ],
		},
	},
};

module.exports = config;
