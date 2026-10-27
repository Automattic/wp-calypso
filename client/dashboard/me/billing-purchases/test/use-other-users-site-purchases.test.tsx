/**
 * @jest-environment jsdom
 */
import { fetchSitePurchases } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { AuthContext } from '../../../app/auth';
import { useOtherUsersSitePurchases } from '../use-other-users-site-purchases';
import type { Purchase, Site, User } from '@automattic/api-core';

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchSitePurchases: jest.fn(),
} ) );

const mockFetchSitePurchases = fetchSitePurchases as jest.MockedFunction<
	typeof fetchSitePurchases
>;

const VIEWER_ID = 1;
const OTHER_USER_ID = 2;

const managedSite = { ID: 100, capabilities: { manage_options: true } } as Site;
const unmanagedSite = { ID: 200, capabilities: { manage_options: false } } as Site;

function makePurchase( ID: number, user_id: number ) {
	return { ID, user_id, blog_id: managedSite.ID } as Purchase;
}

function makeWrapper() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return function Wrapper( { children }: { children: ReactNode } ) {
		return (
			<QueryClientProvider client={ queryClient }>
				<AuthContext.Provider value={ { user: { ID: VIEWER_ID } as User, logout: jest.fn() } }>
					{ children }
				</AuthContext.Provider>
			</QueryClientProvider>
		);
	};
}

describe( 'useOtherUsersSitePurchases', () => {
	beforeEach( () => {
		mockFetchSitePurchases.mockReset();
	} );

	// CHE-585: a site filter hid purchases another administrator made on the site.
	test( 'returns purchases on a filtered site that belong to other users', async () => {
		mockFetchSitePurchases.mockResolvedValue( [
			makePurchase( 1, VIEWER_ID ),
			makePurchase( 2, OTHER_USER_ID ),
		] );

		const { result } = renderHook(
			() => useOtherUsersSitePurchases( { siteIds: [ managedSite.ID ], sites: [ managedSite ] } ),
			{ wrapper: makeWrapper() }
		);

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( mockFetchSitePurchases ).toHaveBeenCalledWith( managedSite.ID );
		// The viewer's own purchases come from `userPurchasesQuery()`, so they are left out here.
		expect( result.current.purchases.map( ( purchase ) => purchase.ID ) ).toEqual( [ 2 ] );
	} );

	// The site endpoint rejects non-managers, so asking would only fill the cache with errors.
	test( 'does not fetch for filtered sites the viewer cannot manage', () => {
		const { result } = renderHook(
			() =>
				useOtherUsersSitePurchases( {
					siteIds: [ unmanagedSite.ID ],
					sites: [ unmanagedSite ],
				} ),
			{ wrapper: makeWrapper() }
		);

		expect( mockFetchSitePurchases ).not.toHaveBeenCalled();
		expect( result.current ).toEqual( { purchases: [], isLoading: false } );
	} );
} );
