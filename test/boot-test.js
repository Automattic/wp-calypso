const Chai = require( 'chai' ),
	sinonChai = require( 'sinon-chai' ),
	sinon = require( 'sinon' ),
	immutableChai = require( './test/helpers/immutable-chai' ),
	nock = require( 'nock' );

module.exports = {
	before: function() {
		Chai.use( immutableChai );
		Chai.use( sinonChai );
		sinon.assert.expose( Chai.assert, { prefix: '' } );
	},
	after: function() {
		nock.cleanAll();
		nock.restore();
	}
};
