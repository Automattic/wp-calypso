import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getFlowFromURL,
	getSessionIdFromURL,
} from 'calypso/landing/stepper/utils/get-flow-from-url';

const PREFIX = 'stepper-state-item';
const VERSION = 'v1';

type FlowState = Record< string, unknown >;

const PERSISTENCE_CONFIG = {
	staleTime: Infinity,
	refetchOnMount: false,
	refetchOnWindowFocus: false,
	refetchOnReconnect: false,
	networkMode: 'always',
} as const;

export function useFlowState() {
	const queryClient = useQueryClient();
	const flow = getFlowFromURL() || 'flow';
	const session = getSessionIdFromURL();

	const { data: state } = useQuery< FlowState >( {
		queryKey: [ PREFIX, flow, session, VERSION ],
		...PERSISTENCE_CONFIG,
	} );

	function get( key: string ): unknown {
		return state?.[ key ];
	}

	function set( key: string, value: unknown ) {
		queryClient.setQueryData( [ PREFIX, flow, session, VERSION ], {
			...state,
			[ key ]: value,
		} );
	}

	return {
		get,
		set,
	};
}
