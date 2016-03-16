function requireTestFiles( config, path = '' ) {
	Object.keys( config ).forEach( ( folderName ) => {
		const folderConfig = config[ folderName ];

		if ( folderName === 'test' ) {
			folderConfig.forEach( fileName => require( `${path}test/${fileName}` ) );
		} else {
			describe( folderName, () => {
				requireTestFiles( folderConfig, `${path}${folderName}/` );
			} );
		}
	} );
}

// this assumes that there's a tests.json at the root of NODE_PATH
requireTestFiles( require( 'tests.json' ) );
