// Mock heavy dependencies so module-level side effects don't interfere.
jest.mock( '@tanstack/react-query-persist-client', () => ( {
	persistQueryClient: jest.fn( () => [ jest.fn(), Promise.resolve() ] ),
} ) );

jest.mock( '../site-collision-listener', () => ( {
	startSiteCollisionListener: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-support-session', () => ( {
	isSupportSession: jest.fn( () => false ),
} ) );

import { clearQueryClient, setAuthenticatedUserId } from '../query-client';

const reactQueryCacheKey = 'REACT_QUERY_OFFLINE_CACHE';
const dashboardUserIdKey = 'dashboard-user-id';

describe( 'clearQueryClient', () => {
	beforeEach( () => {
		localStorage.clear();
	} );

	test( 'removes the React Query cache from localStorage', () => {
		localStorage.setItem( reactQueryCacheKey, '{"queries":[]}' );
		clearQueryClient();
		expect( localStorage.getItem( reactQueryCacheKey ) ).toBeNull();
	} );

	test( 'removes the stored user ID from localStorage', () => {
		localStorage.setItem( dashboardUserIdKey, '123' );
		clearQueryClient();
		expect( localStorage.getItem( dashboardUserIdKey ) ).toBeNull();
	} );

	test( 'removes both keys in the same call', () => {
		localStorage.setItem( reactQueryCacheKey, '{"queries":[]}' );
		localStorage.setItem( dashboardUserIdKey, '456' );
		clearQueryClient();
		expect( localStorage.getItem( reactQueryCacheKey ) ).toBeNull();
		expect( localStorage.getItem( dashboardUserIdKey ) ).toBeNull();
	} );
} );

describe( 'setAuthenticatedUserId', () => {
	beforeEach( () => {
		localStorage.clear();
	} );

	test( 'stores the user ID as a string in localStorage', () => {
		setAuthenticatedUserId( 789 );
		expect( localStorage.getItem( dashboardUserIdKey ) ).toBe( '789' );
	} );

	test( 'overwrites an existing stored user ID', () => {
		localStorage.setItem( dashboardUserIdKey, '111' );
		setAuthenticatedUserId( 222 );
		expect( localStorage.getItem( dashboardUserIdKey ) ).toBe( '222' );
	} );
} );
