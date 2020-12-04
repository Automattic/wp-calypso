const path = require( 'path' );

module.exports = ( { config } ) => {
	config.module.rules.push( {
		test: /\.tsx?$/,
		include: path.join( __dirname, '../src' ),
		use: [
			'ts-loader',
			{
				loader: 'react-docgen-typescript-loader',
				options: {
					tsconfigPath: path.join( __dirname, '../tsconfig.json' ),
				},
			},
		],
	} );

	config.resolve.extensions.push( '.ts', '.tsx' );

	return config;
};
