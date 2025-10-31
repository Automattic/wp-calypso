import {
	setSiteUpdateScheduleActive,
	type HostingUpdateSchedulesResponse,
	type UpdateSchedule,
} from '@automattic/api-core';
import {
	hostingUpdateSchedulesQuery,
	queryClient,
	siteUpdateSchedulesQuery,
} from '@automattic/api-queries';
import { useCallback } from '@wordpress/element';

/**
 * Toggle schedule active state with optimistic updates, mirroring legacy behavior.
 * Keeps parity with v1 while matching v2 hook style.
 */
export function useToggleScheduleActive() {
	const mutateAsync = useCallback(
		async ( variables: { siteId: number; scheduleId: string; active: boolean } ) => {
			const { siteId, scheduleId, active } = variables;

			// Snapshot previous caches
			const siteQuery = siteUpdateSchedulesQuery( siteId );
			const prevSite = queryClient.getQueryData< UpdateSchedule[] >( siteQuery.queryKey );
			const hostingQuery = hostingUpdateSchedulesQuery();
			const prevHosting = queryClient.getQueryData< HostingUpdateSchedulesResponse >(
				hostingQuery.queryKey
			);

			// Optimistically update site list
			if ( prevSite ) {
				const nextSite = prevSite.map( ( item ) =>
					item.id === scheduleId ? { ...item, active } : item
				);
				queryClient.setQueryData( siteQuery.queryKey, nextSite );
			}

			// Optimistically update hosting list
			if ( prevHosting?.sites ) {
				const key = String( siteId );
				if ( prevHosting.sites[ key ]?.[ scheduleId ] ) {
					const cloned = JSON.parse( JSON.stringify( prevHosting ) );
					cloned.sites[ key ][ scheduleId ].active = active;
					queryClient.setQueryData( hostingQuery.queryKey, cloned );
				}
			}

			try {
				await setSiteUpdateScheduleActive( siteId, scheduleId, active );
			} catch ( e ) {
				// Rollback on error
				if ( prevSite ) {
					queryClient.setQueryData( siteQuery.queryKey, prevSite );
				}
				if ( prevHosting ) {
					queryClient.setQueryData( hostingQuery.queryKey, prevHosting );
				}
				throw e;
			}

			// Invalidate to refetch fresh data
			await queryClient.invalidateQueries( siteQuery );
			await queryClient.invalidateQueries( hostingQuery );
		},
		[]
	);

	return { mutateAsync } as const;
}
