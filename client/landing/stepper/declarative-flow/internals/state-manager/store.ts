import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getFlowFromURL,
	getSessionIdFromURL,
} from 'calypso/landing/stepper/utils/get-flow-from-url';
import { FlowStateManifest } from './stepper-state-manifest';

const PREFIX = 'stepper-state-item';
const VERSION = 'v1';

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

	const { data: state = {} } = useQuery< FlowStateManifest >( {
		queryKey: [ PREFIX, flow, session, VERSION ],
		...PERSISTENCE_CONFIG,
	} );

	function get< T extends keyof FlowStateManifest >( key: T ) {
		return state[ key ];
	}

	function set< T extends keyof FlowStateManifest >( key: T, value: FlowStateManifest[ T ] ) {
		queryClient.setQueryData( [ PREFIX, flow, session, VERSION ], {
			...state,
			[ key ]: value,
		} );
		return value;
	}

	return {
		get,
		set,
	};
}
