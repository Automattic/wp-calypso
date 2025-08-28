import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { getSessionId } from 'calypso/landing/stepper/utils/use-session-id';
import type { FlowStateManifest } from './stepper-state-manifest';

const PREFIX = 'stepper-state-item';
const VERSION = 'v1';

/**
 * We don't to ever refetch this query. This is no backend to sync with.
 * The data only ever changes when we mutate it ourselves, in which case we invalidate the query manually.
 */
const PERSISTENCE_CONFIG = {
	staleTime: Infinity,
	refetchOnMount: false,
	refetchOnWindowFocus: false,
	refetchOnReconnect: false,
	/**
	 * This query doesn't really depend on network, so ask useQuery to always fetch even if the network is offline.
	 */
	networkMode: 'always',
} as const;

const DEFAULT_STATE: Partial< FlowStateManifest > = {};

/**
 * Returns a setter and a getter for the flow state. This persists the state for 7 days. The persistence is based on the flow and the session ID.
 */
export function useFlowState() {
	const queryClient = useQueryClient();
	const flow = getFlowFromURL() || 'flow';
	const session = getSessionId();
	const queryKey = useMemo( () => [ PREFIX, flow, session, VERSION ] as const, [ flow, session ] );
	const state = queryClient.getQueryData< FlowStateManifest >( queryKey ) ?? DEFAULT_STATE;

	useEffect( () => {
		queryClient.setQueryDefaults( queryKey, PERSISTENCE_CONFIG );
	}, [ queryClient, queryKey ] );

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
