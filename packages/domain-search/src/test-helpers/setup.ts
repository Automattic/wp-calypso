import '@testing-library/jest-dom/vitest';
import nock from 'nock';
import ResizeObserver from 'resize-observer-polyfill';
import { queryClient } from './renderer';

globalThis.ResizeObserver = ResizeObserver;

// React Testing Library's `waitFor` only advances fake timers when it finds a global `jest`.
( globalThis as unknown as Record< string, unknown > ).jest = {
	advanceTimersByTime: ( ms: number ) => vi.advanceTimersByTime( ms ),
};

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
