module.exports = {
	extends: require.resolve( '@automattic/calypso-build/babel.config.js' ),
	plugins: [
		[
			'@wordpress/import-jsx-pragma',
			{
				scopeVariable: 'createElement',
				source: '@wordpress/element',
				isDefault: false,
			},
		],
		[
			'@babel/transform-react-jsx',
			{
				pragma: 'createElement',
			},
		],
	],
};
