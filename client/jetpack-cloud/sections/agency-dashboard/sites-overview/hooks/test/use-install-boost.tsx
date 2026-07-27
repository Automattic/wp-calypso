/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { DASHBOARD_SITES_QUERY_KEY } from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import wpcom from 'calypso/lib/wp';
import useInstallBoost from '../use-install-boost';
import type { ReactNode } from 'react';

// Both clients share one `req` so the mock holds whichever one `isA8CForAgencies()` selects.
jest.mock( 'calypso/lib/wp', () => {
	const req = { post: jest.fn() };
	return { __esModule: true, default: { req }, wpcomJetpackLicensing: { req } };
} );

const mockedPost = wpcom.req.post as jest.MockedFunction< typeof wpcom.req.post >;

const BOOSTED_SITE_ID = 1;
const OTHER_SITE_ID = 2;

// Two cached pages of the list, keyed the way the dashboard keys them: same prefix, different
// search/filter/pagination tails.
const FIRST_PAGE_KEY = [ DASHBOARD_SITES_QUERY_KEY, undefined, 1, { issueTypes: [] }, 50 ];
const SEARCHED_KEY = [ DASHBOARD_SITES_QUERY_KEY, 'example', 1, { issueTypes: [] }, 50 ];

const sitesData = () => ( {
	total: 2,
	sites: [
		{ blog_id: BOOSTED_SITE_ID, has_pending_boost_one_time_score: false },
		{ blog_id: OTHER_SITE_ID, has_pending_boost_one_time_score: false },
	],
} );

const pendingScoreFor = ( queryClient: QueryClient, queryKey: unknown[], blogId: number ) =>
	queryClient
		.getQueryData< ReturnType< typeof sitesData > >( queryKey )
		?.sites.find( ( site ) => site.blog_id === blogId )?.has_pending_boost_one_time_score;

const renderInstallBoost = () => {
	const queryClient = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
	queryClient.setQueryData( FIRST_PAGE_KEY, sitesData() );
	queryClient.setQueryData( SEARCHED_KEY, sitesData() );

	const store = createStore( () => ( { a8cForAgencies: { agencies: {} } } ) );

	const wrapper = ( { children }: { children?: ReactNode } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	const { result } = renderHook( () => useInstallBoost( BOOSTED_SITE_ID, 'example.com' ), {
		wrapper,
	} );

	return { queryClient, result };
};

describe( 'useInstallBoost', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'flags the site as awaiting its score in every cached sites query', async () => {
		mockedPost.mockResolvedValue( { success: true } );

		const { queryClient, result } = renderInstallBoost();

		act( () => result.current.installBoost() );

		await waitFor( () =>
			expect( pendingScoreFor( queryClient, FIRST_PAGE_KEY, BOOSTED_SITE_ID ) ).toBe( true )
		);
		expect( pendingScoreFor( queryClient, SEARCHED_KEY, BOOSTED_SITE_ID ) ).toBe( true );
		expect( pendingScoreFor( queryClient, FIRST_PAGE_KEY, OTHER_SITE_ID ) ).toBe( false );
	} );

	test( 'leaves the cached site untouched when the install fails', async () => {
		mockedPost.mockRejectedValue( { message: 'nope' } );

		const { queryClient, result } = renderInstallBoost();

		act( () => result.current.installBoost() );

		await waitFor( () => expect( result.current.status ).toBe( 'error' ) );
		expect( pendingScoreFor( queryClient, FIRST_PAGE_KEY, BOOSTED_SITE_ID ) ).toBe( false );
	} );
} );
