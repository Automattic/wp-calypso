module.exports = ( { isBrowser = true, outputPOT = 'build', importSource } = {} ) => ( {
	presets: [ [ require.resolve( './presets/default' ), { bugfixes: true, importSource } ] ],
	plugins: [ [ '@automattic/babel-plugin-transform-wpcalypso-async', { ignore: ! isBrowser } ] ],
	env: {
		production: {
			plugins: [ 'babel-plugin-transform-react-remove-prop-types' ],
		},
		build_pot: {
			plugins: [
				[
					'@automattic/babel-plugin-i18n-calypso',
					{
						dir: outputPOT,
						headers: {
							'content-type': 'text/plain; charset=UTF-8',
							'x-generator': 'calypso',
						},
					},
				],
			],
		},
		test: {
			presets: [ [ '@babel/preset-env', { targets: { node: 'current' } } ] ],
			plugins: [ 'babel-plugin-dynamic-import-node' ],
		},
	},
} );
