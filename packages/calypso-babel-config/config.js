module.exports = ( { importSource } = {} ) => ( {
	presets: [ [ require.resolve( './presets/default' ), { importSource } ] ],
	env: {
		production: {
			plugins: [ 'babel-plugin-transform-react-remove-prop-types' ],
		},
		test: {
			presets: [ [ '@babel/preset-env', { targets: { node: 'current' } } ] ],
		},
	},
} );
