import { agencyScheduleCallLinkQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

const A4A_SCHEDULE_CALL_FALLBACK_URL =
	'https://meetings.hubspot.com/automattic-for-agencies/discovery-meeting';

/**
 * Ported from client/a8c-for-agencies/hooks/use-schedule-call.ts.
 * Lazily fetches the agency's schedule-call link and opens it in a new tab,
 * falling back to the default HubSpot meeting URL on error.
 */
export function useScheduleCall( agencyId?: number ) {
	const { refetch, isFetching } = useQuery( agencyScheduleCallLinkQuery( agencyId ?? 0 ) );

	const scheduleCall = useCallback( async () => {
		try {
			const result = await refetch();
			window.open( result.data || A4A_SCHEDULE_CALL_FALLBACK_URL, '_blank' );
		} catch {
			window.open( A4A_SCHEDULE_CALL_FALLBACK_URL, '_blank' );
		}
	}, [ refetch ] );

	return { scheduleCall, isLoading: isFetching };
}
