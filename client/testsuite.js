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

function requireSuite( module ) {
	describe( module, function() {
		require( `${module}/test` );
	} );
}

[
	'lib/post-formats',
	'lib/post-normalizer',
	'lib/post-metadata',
	'lib/posts'
].forEach( requireSuite );
