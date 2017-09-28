const Chai = require( 'chai' ),
	sinonChai = require( 'sinon-chai' ),
	chaiEnzyme = require( 'chai-enzyme' ),
	sinon = require( 'sinon' ),
	nock = require( 'nock' );

module.exports = {
	before: function() {
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
