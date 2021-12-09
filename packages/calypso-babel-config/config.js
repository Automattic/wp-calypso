module.exports = ( { isBrowser = true, outputPOT = 'build' } = {} ) => ( {
	presets: [ [ require.resolve( './presets/default' ), { bugfixes: true } ] ],
	plugins: [
		[ '@automattic/babel-plugin-transform-wpcalypso-async', { async: true, ignore: ! isBrowser } ],
	],
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
		storybook: {
			// Forces some plugins to load in loose mode, used by Storybook.
			// See https://github.com/storybookjs/storybook/issues/14805
			plugins: [
				[ require.resolve( '@babel/plugin-proposal-private-property-in-object' ), { loose: true } ],
				[ require.resolve( '@babel/plugin-proposal-class-properties' ), { loose: true } ],
				[ require.resolve( '@babel/plugin-proposal-private-methods' ), { loose: true } ],
			],
		},
	},
} );
