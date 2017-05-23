const chai = require( 'chai' ),
	sinonChai = require( 'sinon-chai' ),
	chaiEnzyme = require( 'chai-enzyme' ),
	sinon = require( 'sinon' ),
	immutableChai = require( './test/helpers/immutable-chai' ),
	nock = require( 'nock' );

chai.use( immutableChai );
chai.use( sinonChai );
chai.use( chaiEnzyme() );
sinon.assert.expose( chai.assert, { prefix: '' } );
nock.disableNetConnect();

// Make sure chai and jasmine ".not" play nice together
const originalNot = Object.getOwnPropertyDescriptor( chai.Assertion.prototype, 'not' ).get;

Object.defineProperty( chai.Assertion.prototype, 'not', {
	get() {
		Object.assign( this, this.assignedNot );
		return originalNot.apply( this );
	},
	set( newNot ) {
		this.assignedNot = newNot;
		return newNot;
	},
} );

// Combine both jest and chai matchers on expect
const originalExpect = global.expect;

global.expect = ( actual ) => {
	const originalMatchers = originalExpect( actual );
	const chaiMatchers = chai.expect( actual );

	return Object.assign( chaiMatchers, originalMatchers );
};

global.before = global.beforeAll;
global.after = global.afterAll;
