/**
 * External dependencies
 */
import { assert } from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';

/**
 * Internal dependencies
 */
import immutableChai from './test/helpers/immutable-chai';

chai.use( immutableChai );
chai.use( sinonChai );
assert.expose( chai.assert, { prefix: '' } );

// Make sure we can share test helpers between Mocha and Jest
global.after = global.afterAll;
global.before = global.beforeAll;
global.context = global.describe;
