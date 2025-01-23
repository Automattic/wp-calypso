import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { getSessionId } from 'calypso/landing/stepper/utils/use-session-id';
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

/**
 * Returns a setter and a getter for the flow state. This persists the state for 7 days. The persistence is based on the flow and the session ID.
 */
export function useFlowState() {
	const queryClient = useQueryClient();
	const flow = getFlowFromURL() || 'flow';
	const session = getSessionId();

	const { data: state = {} } = useQuery< FlowStateManifest >( {
		queryKey: [ PREFIX, flow, session, VERSION ],
		...PERSISTENCE_CONFIG,
	} );

	function get< T extends keyof FlowStateManifest >( key: T ) {
		return state[ key ];
	}

	function set< T extends keyof FlowStateManifest >(
		key: T,
		value: unknown
	): FlowStateManifest[ T ] {
		queryClient.setQueryData( [ PREFIX, flow, session, VERSION ], {
			...state,
			[ key ]: value,
		} );
		return value as FlowStateManifest[ T ];
	}

	return {
		get,
		set,
	};
}
