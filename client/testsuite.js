/**
 * External dependencies
 */
import Chai from 'chai';
import sinonChai from 'sinon-chai';
import nock from 'nock';

// These act like global before / after lifecycle bits
before( () => {
	Chai.use( sinonChai );
	nock.disableNetConnect();
} );

after( () => {
	nock.cleanAll();
	nock.enableNetConnect();
	nock.restore();
} );

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
