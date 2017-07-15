/**
 * External dependencies
 */
import { assert } from 'sinon';
import { disableNetConnect } from 'nock';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import sinonChai from 'sinon-chai';

chai.use( sinonChai );
chai.use( chaiEnzyme() );
assert.expose( chai.assert, { prefix: '' } );
disableNetConnect();

// Make sure we can share test helpers between Mocha and Jest
global.after = global.afterAll;
global.before = global.beforeAll;
global.context = global.describe;
