function requireTestFiles( config, path = '' ) {
	Object.keys( config ).map( ( folderName ) => {
		const folderConfig = config[ folderName ];

		if ( folderName === 'test' ) {
			folderConfig.forEach( fileName => require( `${path}test/${fileName}.js` ) );
		} else {
			describe( folderName, () => {
				requireTestFiles( folderConfig, `${path}${folderName}/` );
			} );
		}
	} );
}

requireTestFiles( require( 'test/config.json' ) );
