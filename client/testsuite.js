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
		describe( folderName, () => {
			const folderConfig = config[ folderName ],
				folderPath = `${path}${folderName}/`;

			if ( Array.isArray( folderConfig ) ) {
				folderConfig.forEach( fileName => require( `${folderPath}test/${fileName}.js` ) );
			} else {
				requireTestFiles( folderConfig, folderPath );
			}
		} );
	} );
}

requireTestFiles( {
	lib: {
		domains: [ 'index' ],
		'post-formats': [ 'index' ],
		'post-normalizer': [ 'index' ],
		'post-metadata': [ 'index' ],
		posts: [ 'index' ],
		store: [ 'index-test' ]
	},
	state: [ 'index' ]
} );
