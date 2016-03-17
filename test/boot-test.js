require( 'babel/register' );
const Chai = require( 'chai' ),
	sinonChai = require( 'sinon-chai' ),
	sinon = require( 'sinon' ),
	immutableChai = require( './test/helpers/immutable-chai' ),
	nock = require( 'nock' );

module.exports = {
	before: function() {
		if ( process.env.CIRCLECI ) {
			console.log( 'Hello Circle!' );
			// give circle more time by default because containers are slow
			// why 10 seconds? a guess.
			this.timeout( 10000 );
		}
		Chai.use( immutableChai );
		Chai.use( sinonChai );
		sinon.assert.expose( Chai.assert, { prefix: '' } );
		nock.disableNetConnect();
	},
	after: function() {
		nock.cleanAll();
		nock.enableNetConnect();
		nock.restore();
	}
};
