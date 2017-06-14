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
import immutableChai from 'test/helpers/immutable-chai';

chai.use( immutableChai );
chai.use( sinonChai );
chai.use( chaiEnzyme() );
assert.expose( chai.assert, { prefix: '' } );
disableNetConnect();
enableNetConnect( 'localhost' );

// Make sure we can share test helpers between Mocha and Jest
global.after = global.afterAll;
global.before = global.beforeAll;
global.context = global.describe;
