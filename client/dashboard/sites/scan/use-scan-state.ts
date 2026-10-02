import { SiteScan } from '@automattic/api-core';
import { siteScanEnqueuedQuery, siteScanQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

// Give up on an enqueued scan the backend never picks up. On sites with Backup,
// a full backup runs before the scan starts, so this has to outlast one.
const ENQUEUED_TIMEOUT_MS = 60 * 60 * 1000;

export type ScanStatusType = 'idle' | 'enqueued' | 'running' | 'success' | 'error';

export interface ScanState {
	status: ScanStatusType;
	scan: SiteScan | null;
	setEnqueued: ( enqueued: 'requested' | 'confirmed' | null ) => void;
}

export function useScanState( siteId: number ): ScanState {
	const queryClient = useQueryClient();
	const { data: scan } = useQuery( siteScanQuery( siteId ) );
	const { data: enqueued } = useQuery( siteScanEnqueuedQuery( siteId ) );
	const [ hasSucceeded, setHasSucceeded ] = useState( false );

	const isEnqueued = !! enqueued && Date.now() - enqueued.at < ENQUEUED_TIMEOUT_MS;

	const setEnqueued = useCallback(
		( value: 'requested' | 'confirmed' | null ) => {
			queryClient.setQueryData( siteScanEnqueuedQuery( siteId ).queryKey, ( previous ) => {
				if ( value === 'requested' ) {
					return { at: Date.now(), confirmed: false };
				}
				// Confirming after the scan has already started (and cleared the flag) must not revive it.
				if ( value === 'confirmed' && previous ) {
					return { ...previous, confirmed: true };
				}
				return null;
			} );
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
			setEnqueued( null );
		}
	}, [ isEnqueued, isRunning, setEnqueued ] );

	if ( isEnqueued ) {
		return { status: 'enqueued', scan: scan ?? null, setEnqueued };
	} else if ( hasSucceeded ) {
		return { status: 'success', scan: scan ?? null, setEnqueued };
	}

	if ( scan?.most_recent?.timestamp && scan.most_recent.timestamp.length > 0 ) {
		if ( ! timeStampRef.current ) {
			timeStampRef.current = scan.most_recent.timestamp;
			return { status: 'idle', scan, setEnqueued };
		} else if ( timeStampRef.current !== scan.most_recent.timestamp ) {
			timeStampRef.current = scan.most_recent.timestamp;
			setHasSucceeded( true );
			return { status: 'success', scan, setEnqueued };
		}
	}

	if ( isRunning ) {
		return { status: 'running', scan, setEnqueued };
	} else if ( scan?.most_recent?.error ) {
		return { status: 'error', scan, setEnqueued };
	}

	return { status: 'idle', scan: scan ?? null, setEnqueued };
}
