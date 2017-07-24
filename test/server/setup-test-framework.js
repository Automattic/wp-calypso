/**
 * External dependencies
 */
import { disableNetConnect } from 'nock';
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use( sinonChai );
disableNetConnect();

// Make sure we can share test helpers between Mocha and Jest
global.after = global.afterAll;
global.before = global.beforeAll;
global.context = global.describe;
