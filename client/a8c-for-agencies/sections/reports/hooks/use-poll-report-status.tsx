import { useEffect, useRef } from 'react';
import useFetchReportById from './use-fetch-report-by-id';
import type { Report, ReportStatus } from '../types';

interface PollReportStatusResult {
	data: Report | undefined;
	status: ReportStatus | undefined;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	isProcessed: boolean;
	isPending: boolean;
	isErrorStatus: boolean;
}

const POLL_INTERVAL = 10000; // 10 seconds

export default function usePollReportStatus( reportId: number | null ): PollReportStatusResult {
	const intervalRef = useRef< NodeJS.Timeout | null >( null );

	// Use the existing fetch hook
	const { data, isLoading, isError, error, refetch } = useFetchReportById( reportId );

	const status = data?.status;
	const isProcessed = status ? [ 'sent', 'processed' ].includes( status ) : false;
	const isPending = status === 'pending';
	const isErrorStatus = status === 'error';

	// Set up polling when the report is still pending
	useEffect( () => {
		if ( ! reportId ) {
			return;
		}

		// Only poll if the status is pending
		if ( isPending ) {
			intervalRef.current = setInterval( () => {
				refetch();
			}, POLL_INTERVAL );
		}

		// Clear interval if status is not pending
		if ( ! isPending && intervalRef.current ) {
			clearInterval( intervalRef.current );
			intervalRef.current = null;
		}

		// Cleanup interval on unmount
		return () => {
			if ( intervalRef.current ) {
				clearInterval( intervalRef.current );
				intervalRef.current = null;
			}
		};
	}, [ reportId, isPending, refetch ] );

	return {
		data,
		status,
		isLoading,
		isError,
		error,
		isProcessed,
		isPending: isPending || isLoading,
		isErrorStatus,
	};
}
