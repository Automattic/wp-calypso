import nock from 'nock';
import { queryClient } from './renderer';

// Disables all network requests for all tests.
nock.disableNetConnect();

beforeAll( () => {
	// reactivate nock on test start
	if ( ! nock.isActive() ) {
		nock.activate();
	}
} );

afterEach( () => {
	queryClient.clear();
} );

afterAll( () => {
	// helps clean up nock after each test run and avoid memory leaks
	nock.restore();
	nock.cleanAll();
} );
