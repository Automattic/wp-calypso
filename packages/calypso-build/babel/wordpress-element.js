module.exports = () => ( {
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
} );
