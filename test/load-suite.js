const setup = require( 'setup' );

function requireTestFiles( config, path = '' ) {
	Object.keys( config ).forEach( ( folderName ) => {
		const folderConfig = config[ folderName ];

		if ( folderName === 'test' && Array.isArray( folderConfig ) ) {
			folderConfig.forEach( fileName => require( `${path}test/${fileName}` ) );
		} else {
			describe( folderName, () => {
				requireTestFiles( folderConfig, `${path}${folderName}/` );
			} );
		}
	} );
}

requireTestFiles( setup.getConfig() );
