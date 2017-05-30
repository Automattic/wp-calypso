/**
 * External dependencies
 */
import { assert } from 'sinon';
import { disableNetConnect, enableNetConnect } from 'nock';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import sinonChai from 'sinon-chai';

/**
 * Internal dependencies
 */
import immutableChai from './test/helpers/immutable-chai';

chai.use( immutableChai );
chai.use( sinonChai );
chai.use( chaiEnzyme() );
assert.expose( chai.assert, { prefix: '' } );
disableNetConnect();
enableNetConnect( 'localhost' );

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

global.expect = actual => {
	const originalMatchers = originalExpect( actual );
	const chaiMatchers = chai.expect( actual );

	return Object.assign( chaiMatchers, originalMatchers );
};

// Make sure we can share test helpers between Mocha and Jest
global.before = global.beforeAll;
global.after = global.afterAll;
