module.exports = () => ( {
	// No JSX syntax in .ts files; see the note in the default preset.
	overrides: [
		{
			exclude: /\.ts$/,
			plugins: [
				[
					require.resolve( '@wordpress/babel-plugin-import-jsx-pragma' ),
					{
						scopeVariable: 'createElement',
						scopeVariableFrag: 'Fragment',
						source: '@wordpress/element',
						isDefault: false,
					},
				],
				[
					require.resolve( '@babel/plugin-transform-react-jsx' ),
					{
						pragma: 'createElement',
						pragmaFrag: 'Fragment',
					},
				],
			],
		},
	],
} );
