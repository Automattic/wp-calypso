import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const PREFIX = 'stepper-state-item';
const VERSION = 'v1';

type StateTuple< ValueType > = [ ValueType, ( newValue: ValueType ) => void ];

export function useFlowState< ValueType >(
	key: string,
	defaultValue: ValueType
): StateTuple< ValueType > {
	const queryClient = useQueryClient();

	const { data } = useQuery< ValueType >( {
		queryKey: [ PREFIX, key, VERSION ],
		staleTime: Infinity,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		networkMode: 'always',
	} );

	const setState = useCallback(
		( newValue: ValueType ) => {
			queryClient.setQueryData( [ PREFIX, key, VERSION ], newValue );
		},
		[ key, queryClient ]
	);

	return [ data || defaultValue, setState ];
}
