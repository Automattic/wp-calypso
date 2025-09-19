import { SiteScan } from '@automattic/api-core';
import { siteScanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

export type ScanStateType = 'idle' | 'running' | 'success' | 'error';

export interface ScanState {
	status: ScanStateType;
	scan: SiteScan | null;
}

export function useScanState( siteId: number ): ScanState {
	const { data: scan } = useQuery( siteScanQuery( siteId ) );
	const timeStampRef = useRef< string | null >( null );

	if ( scan?.most_recent?.timestamp && scan.most_recent.timestamp.length > 0 ) {
		if ( ! timeStampRef.current ) {
			timeStampRef.current = scan.most_recent.timestamp;
			return { status: 'idle', scan };
		} else if ( timeStampRef.current !== scan.most_recent.timestamp ) {
			timeStampRef.current = scan.most_recent.timestamp;
			return { status: 'success', scan };
		}
	}

	if ( ! scan?.most_recent && scan?.current ) {
		return { status: 'running', scan };
	} else if ( scan?.most_recent?.error ) {
		return { status: 'error', scan };
	}

	return { status: 'idle', scan: scan ?? null };
}
