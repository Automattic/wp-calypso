const Chai = require( 'chai' ),
	sinonChai = require( 'sinon-chai' ),
	chaiEnzyme = require( 'chai-enzyme' ),
	sinon = require( 'sinon' ),
	immutableChai = require( './test/helpers/immutable-chai' ),
	nock = require( 'nock' );

module.exports = {
	before: function() {
		Chai.use( immutableChai );
		Chai.use( sinonChai );
		Chai.use( chaiEnzyme() );
		sinon.assert.expose( Chai.assert, { prefix: '' } );
		nock.disableNetConnect();
	},
	after: function() {
		nock.cleanAll();
		nock.enableNetConnect();
		nock.restore();
	}
};
