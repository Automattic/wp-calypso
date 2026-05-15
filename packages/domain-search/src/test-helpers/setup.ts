import nock from 'nock';
import { queryClient } from './renderer';

// jsdom does not implement IntersectionObserver. Provide a no-op stub so that
// ResultsPage (which uses one for the sticky sentinel) renders without error.
(
	globalThis as typeof globalThis & { IntersectionObserver: typeof IntersectionObserver }
 ).IntersectionObserver = jest.fn( () => ( {
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
	root: null,
	rootMargin: '',
	thresholds: [],
	takeRecords: jest.fn( () => [] ),
} ) ) as unknown as typeof IntersectionObserver;

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
