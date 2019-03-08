module.exports = {
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
		'react/forbid-elements': [
			'error',
			{
				forbid: [
					[ 'circle', 'Circle' ],
					[ 'g', 'G' ],
					[ 'path', 'Path' ],
					[ 'polygon', 'Polygon' ],
					[ 'rect', 'Rect' ],
					[ 'svg', 'SVG' ],
				].map( ( [ element, componentName ] ) => ( {
					element,
					message: `use <${ componentName }> from @wordpress/components`,
				} ) ),
			},
		],
		'react/react-in-jsx-scope': 0,
		'wpcalypso/jsx-classname-namespace': 0,
	},
};
