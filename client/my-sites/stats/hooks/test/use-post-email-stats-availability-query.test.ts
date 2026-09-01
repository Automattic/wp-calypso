import { QueryClient } from '@tanstack/react-query';
import {
	hasEmailStats,
	postEmailStatsAvailabilityQueryOptions,
	seedPostEmailStatsAvailability,
} from '../use-post-email-stats-availability-query';

describe( 'hasEmailStats', () => {
	it( 'returns false when there is no data', () => {
		expect( hasEmailStats( undefined ) ).toBe( false );
		expect( hasEmailStats( {} ) ).toBe( false );
	} );

	it( 'returns false when the counters are null or zero', () => {
		expect( hasEmailStats( { total_sends: null, total_opens: null } ) ).toBe( false );
		expect( hasEmailStats( { total_sends: 0, total_opens: 0 } ) ).toBe( false );
	} );

	it( 'returns true when the post has sends', () => {
		expect( hasEmailStats( { total_sends: 68036, total_opens: 0 } ) ).toBe( true );
	} );

	it( 'returns true when the post has opens even if sends are not reported', () => {
		expect( hasEmailStats( { total_sends: 0, total_opens: 9109 } ) ).toBe( true );
	} );
} );

describe( 'seedPostEmailStatsAvailability', () => {
	const SITE_ID = 1;
	const POST_ID = 2;
	const { queryKey } = postEmailStatsAvailabilityQueryOptions( SITE_ID, POST_ID );

	it( 'seeds an empty cache with an already-stale positive', () => {
		const queryClient = new QueryClient();

		seedPostEmailStatsAvailability( queryClient, SITE_ID, POST_ID );

		expect( hasEmailStats( queryClient.getQueryData( queryKey ) ) ).toBe( true );
		// Stale from birth: the mount refetch still runs, so a wrongly seeded
		// post (deep link to a never-emailed post's email page) corrects itself.
		expect( queryClient.getQueryState( queryKey )?.dataUpdatedAt ).toBe( 0 );
	} );

	it( 'overwrites a cached negative so the tab strip renders immediately', () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( queryKey, { total_sends: 0, total_opens: 0 } );

		seedPostEmailStatsAvailability( queryClient, SITE_ID, POST_ID );

		expect( hasEmailStats( queryClient.getQueryData( queryKey ) ) ).toBe( true );
		expect( queryClient.getQueryState( queryKey )?.dataUpdatedAt ).toBe( 0 );
	} );

	it( 'leaves a cached positive untouched', () => {
		const queryClient = new QueryClient();
		const real = { total_sends: 68036, total_opens: 9109 };
		queryClient.setQueryData( queryKey, real );
		const updatedAt = queryClient.getQueryState( queryKey )?.dataUpdatedAt;

		seedPostEmailStatsAvailability( queryClient, SITE_ID, POST_ID );

		expect( queryClient.getQueryData( queryKey ) ).toEqual( real );
		expect( queryClient.getQueryState( queryKey )?.dataUpdatedAt ).toBe( updatedAt );
	} );
} );
