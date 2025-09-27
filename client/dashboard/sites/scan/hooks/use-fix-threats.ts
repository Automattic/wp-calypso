import {
	fixThreatsMutation,
	fixThreatsStatusQuery,
	siteScanQuery,
	siteScanHistoryQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';

type FixState = 'idle' | 'fixing' | 'completed';

export function useFixThreats( siteId: number, threatIds: number[] ) {
	const queryClient = useQueryClient();
	const [ fixState, setFixState ] = useState< FixState >( 'idle' );

	const fixMutation = useMutation( {
		...fixThreatsMutation( siteId ),
		onError: () => setFixState( 'idle' ),
	} );

	const { data: threats = [] } = useQuery( {
		...fixThreatsStatusQuery( siteId, threatIds ),
		refetchInterval: fixState === 'fixing' ? 2000 : false,
		enabled: fixState === 'fixing' && threatIds.length > 0,
		select: ( data ) => {
			if ( ! data?.threats ) {
				return [];
			}
			return Object.entries( data.threats ).map( ( [ id, threat ] ) => ( {
				...threat,
				id: Number( id ),
			} ) );
		},
		gcTime: 0, // Always fetch fresh status data, never use cached results
	} );

	const status = useMemo( () => {
		// If we haven't started fixing yet, not complete
		if ( fixState === 'idle' ) {
			return { isComplete: false, allFixed: false };
		}

		// If fixing but no threat data yet, not complete
		if ( fixState === 'fixing' && threats.length === 0 ) {
			return { isComplete: false, allFixed: false };
		}

		const pending = threats.filter(
			( t ) => t.status === 'in_progress' || t.status === 'not_started'
		);
		const fixed = threats.filter( ( t ) => t.status === 'fixed' );

		return {
			isComplete: pending.length === 0,
			allFixed: fixed.length === threats.length,
		};
	}, [ threats, fixState ] );

	const startFix = useCallback( () => {
		setFixState( 'fixing' );
		return fixMutation.mutate( threatIds );
	}, [ threatIds, fixMutation ] );

	useEffect( () => {
		if ( status.isComplete && fixState === 'fixing' ) {
			setFixState( 'completed' );
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
			queryClient.invalidateQueries( siteScanHistoryQuery( siteId ) );
		}
	}, [ status, fixState, queryClient, siteId ] );

	return {
		startFix,
		isFixing: fixState === 'fixing',
		status,
		error: fixMutation.error,
	};
}
