import { SiteScan } from '@automattic/api-core';
import { siteScanEnqueuedAtQuery, siteScanQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

// Give up on an enqueued scan the backend never picks up.
const ENQUEUED_TIMEOUT_MS = 5 * 60 * 1000;

export type ScanStatusType = 'idle' | 'enqueued' | 'running' | 'success' | 'error';

export interface ScanState {
	status: ScanStatusType;
	scan: SiteScan | null;
	setIsEnqueued: ( isEnqueued: boolean ) => void;
}

export function useScanState( siteId: number ): ScanState {
	const queryClient = useQueryClient();
	const { data: scan } = useQuery( siteScanQuery( siteId ) );
	const { data: enqueuedAt } = useQuery( siteScanEnqueuedAtQuery( siteId ) );
	const [ hasSucceeded, setHasSucceeded ] = useState( false );

	const isEnqueued = !! enqueuedAt && Date.now() - enqueuedAt < ENQUEUED_TIMEOUT_MS;

	const setIsEnqueued = useCallback(
		( value: boolean ) => {
			queryClient.setQueryData(
				siteScanEnqueuedAtQuery( siteId ).queryKey,
				value ? Date.now() : null
			);
		},
		[ queryClient, siteId ]
	);
	const timeStampRef = useRef< string | null >( null );

	const isRunning = ! scan?.most_recent && scan?.current;

	// Reset state when scan actually starts
	useEffect( () => {
		if ( isEnqueued ) {
			setHasSucceeded( false );
		}
		if ( isRunning ) {
			setIsEnqueued( false );
		}
	}, [ isEnqueued, isRunning, setIsEnqueued ] );

	if ( isEnqueued ) {
		return { status: 'enqueued', scan: scan ?? null, setIsEnqueued };
	} else if ( hasSucceeded ) {
		return { status: 'success', scan: scan ?? null, setIsEnqueued };
	}

	if ( scan?.most_recent?.timestamp && scan.most_recent.timestamp.length > 0 ) {
		if ( ! timeStampRef.current ) {
			timeStampRef.current = scan.most_recent.timestamp;
			return { status: 'idle', scan, setIsEnqueued };
		} else if ( timeStampRef.current !== scan.most_recent.timestamp ) {
			timeStampRef.current = scan.most_recent.timestamp;
			setHasSucceeded( true );
			return { status: 'success', scan, setIsEnqueued };
		}
	}

	if ( isRunning ) {
		return { status: 'running', scan, setIsEnqueued };
	} else if ( scan?.most_recent?.error ) {
		return { status: 'error', scan, setIsEnqueued };
	}

	return { status: 'idle', scan: scan ?? null, setIsEnqueued };
}
