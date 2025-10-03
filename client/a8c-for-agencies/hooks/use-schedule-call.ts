import { useCallback } from 'react';
import useFetchScheduleCallLink from 'calypso/a8c-for-agencies/data/agencies/use-fetch-schedule-call-link';

const DEFAULT_FALLBACK_URL =
	'https://meetings.hubspot.com/automattic-for-agencies/discovery-meeting';

type UseScheduleCallOptions = {
	onSuccess?: () => void;
	onError?: ( error: Error ) => void;
};

type UseScheduleCallReturn = {
	scheduleCall: () => Promise< void >;
	isLoading: boolean;
};

/**
 * A reusable hook for scheduling calls that handles fetching the schedule call link
 * and opening it in a new window with proper fallback handling.
 */
export default function useScheduleCall(
	options: UseScheduleCallOptions = {}
): UseScheduleCallReturn {
	const { onSuccess, onError } = options;

	const { refetch: fetchScheduleCallLink, isFetching } = useFetchScheduleCallLink();

	const scheduleCall = useCallback( async () => {
		try {
			const result = await fetchScheduleCallLink();
			const url = result.data || DEFAULT_FALLBACK_URL;

			window.open( url, '_blank' );
			onSuccess?.();
		} catch ( error ) {
			// If the API call fails, still open the fallback URL
			window.open( DEFAULT_FALLBACK_URL, '_blank' );
			onError?.( error instanceof Error ? error : new Error( 'Unknown error occurred' ) );
		}
	}, [ fetchScheduleCallLink, onSuccess, onError ] );

	return {
		scheduleCall,
		isLoading: isFetching,
	};
}
