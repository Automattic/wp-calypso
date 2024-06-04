module.exports = () => ( {
	plugins: [
		[
			require.resolve( '@babel/plugin-transform-react-jsx' ),
			{
				runtime: 'automatic',
			},
		],
	],
} );
