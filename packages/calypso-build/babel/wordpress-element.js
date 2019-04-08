module.exports = {
	plugins: [
		[
			'@wordpress/babel-plugin-import-jsx-pragma',
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
