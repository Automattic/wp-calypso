import { SiteScan } from '@automattic/api-core';
import { siteScanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

export type ScanStatusType = 'idle' | 'enqueued' | 'running' | 'success' | 'error';

export interface ScanState {
	status: ScanStatusType;
	scan: SiteScan | null;
	setIsEnqueued: ( isEnqueued: boolean ) => void;
}

export function useScanState( siteId: number ): ScanState {
	const { data: scan } = useQuery( siteScanQuery( siteId ) );
	const [ hasSucceeded, setHasSucceeded ] = useState( false );
	const [ isEnqueued, setIsEnqueued ] = useState( false );
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
	}, [ isEnqueued, isRunning ] );

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
