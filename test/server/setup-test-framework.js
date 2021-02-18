/**
 * External dependencies
 */
import * as nock from 'nock';
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use( sinonChai );

// Disables all network requests for all tests.
nock.disableNetConnect();

beforeAll( () => {
	// reactivate nock on test start
	if ( ! nock.isActive() ) {
		nock.activate();
	}
} );

afterAll( () => {
	// helps clean up nock after each test run and avoid memory leaks
	nock.restore();
	nock.cleanAll();
} );
