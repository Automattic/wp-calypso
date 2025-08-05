import { useQueryClient } from '@tanstack/react-query';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { getSessionId } from 'calypso/landing/stepper/utils/use-session-id';
import type { FlowStateManifest } from './stepper-state-manifest';

const PREFIX = 'stepper-state-item';
const VERSION = 'v1';

/**
 * Returns a setter and a getter for the flow state. This persists the state for 7 days. The persistence is based on the flow and the session ID.
 */
export function useFlowState() {
	const queryClient = useQueryClient();
	const flow = getFlowFromURL() || 'flow';
	const session = getSessionId();

	const key = [ PREFIX, flow, session, VERSION ] as const;
	const state = ( queryClient.getQueryData( key ) ?? {} ) as FlowStateManifest;

	function get< T extends keyof FlowStateManifest >( key: T ) {
		return state?.[ key ];
	}

	function set< T extends keyof FlowStateManifest >(
		key: T,
		value: FlowStateManifest[ T ]
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
		sessionId: session,
	};
}
