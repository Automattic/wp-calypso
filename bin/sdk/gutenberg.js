/** @format */
/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

const wpElementPragmaBabelPlugin = [
	'@babel/plugin-transform-react-jsx',
	{
		pragma: 'wp.element.createElement',
		pragmaFrag: 'wp.element.Fragment',
	},
];

exports.config = ( { argv: { inputDir, outputDir }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig( {
		cssFilename: '[name].css',
		externalizeWordPressPackages: true,
	} );
	const editorScript = path.join( inputDir, 'editor.js' );
	const viewScript = path.join( inputDir, 'view.js' );

	baseConfig.module.rules[ 0 ].use = baseConfig.module.rules[ 0 ].use.map( rule => {
		const { loader, options } = rule;
		if ( loader === 'babel-loader' ) {
			const plugins = ( options && options.plugins ) || [];
			return {
				...rule,
				options: {
					...options,
					plugins: [ ...plugins, wpElementPragmaBabelPlugin ],
				},
			};
		}
		return rule;
	} );

	return {
		...baseConfig,
		entry: {
			editor: editorScript,
			...( fs.existsSync( viewScript ) ? { view: viewScript } : {} ),
		},
		output: {
			path: outputDir || path.join( inputDir, 'build' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
	};
};
