import {
	fixThreatsMutation,
	fixThreatsStatusQuery,
	siteScanQuery,
	siteScanHistoryQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';

export function useFixThreats( siteId: number, threatIds: number[] ) {
	const queryClient = useQueryClient();
	const [ isFixing, setIsFixing ] = useState( false );
	const [ hasStartedFixing, setHasStartedFixing ] = useState( false );

	const fixMutation = useMutation( {
		...fixThreatsMutation( siteId ),
		onError: () => setIsFixing( false ),
	} );

	const { data: threats = [] } = useQuery( {
		...fixThreatsStatusQuery( siteId, threatIds ),
		refetchInterval: isFixing ? 2000 : false,
		enabled: isFixing && threatIds.length > 0,
		select: ( data ) => {
			if ( ! data?.threats ) {
				return [];
			}
			return Object.entries( data.threats ).map( ( [ id, threat ] ) => ( {
				...threat,
				id: Number( id ),
			} ) );
		},
	} );

	const status = useMemo( () => {
		// If we haven't started fixing yet, not complete
		if ( ! hasStartedFixing ) {
			return { isComplete: false, allFixed: false };
		}

		// If fixing but no threat data yet, not complete
		if ( threats.length === 0 ) {
			return { isComplete: false, allFixed: false };
		}

		const pending = threats.filter( ( t ) => t.status === 'in_progress' );
		const fixed = threats.filter( ( t ) => t.status === 'fixed' );

		return {
			isComplete: pending.length === 0,
			allFixed: fixed.length === threats.length,
		};
	}, [ threats, hasStartedFixing ] );

	const startFix = useCallback( () => {
		setIsFixing( true );
		setHasStartedFixing( true );
		return fixMutation.mutate( threatIds );
	}, [ threatIds, fixMutation ] );

	useEffect( () => {
		if ( status.isComplete && isFixing ) {
			setIsFixing( false );
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
			queryClient.invalidateQueries( siteScanHistoryQuery( siteId ) );
		}
	}, [ status, isFixing, queryClient, siteId ] );

	return {
		startFix,
		isFixing,
		status,
		error: fixMutation.error,
	};
}
