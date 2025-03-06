import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { getSessionId } from 'calypso/landing/stepper/utils/use-session-id';
import type { FlowStateManifest } from './stepper-state-manifest';
import { AsyncStepperStep, FlowV2, Step } from '../types';

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

type ArrayToRecord< T extends readonly AsyncStepperStep[] > = {
	[ K in T[ number ][ 'slug' ] ]: Parameters<
		Parameters<
			Awaited< ReturnType< Extract< T[ number ], { slug: K } >[ 'asyncComponent' ] > >[ 'default' ]
		>[ 0 ][ 'navigation' ][ 'submit' ]
	>[ 0 ];
};

type AggregatedFlowState< Flow extends FlowV2 > = ArrayToRecord<
	ReturnType< Flow[ 'initialize' ] >
>;

/**
 * Returns a setter and a getter for the flow state. This persists the state for 7 days. The persistence is based on the flow and the session ID.
 */
export function useFlowState< Flow extends FlowV2 >() {
	type FlowState = AggregatedFlowState< Flow >;

	const queryClient = useQueryClient();
	const flow = getFlowFromURL() || 'flow';
	const session = getSessionId();

	const { data: state = {} as FlowState } = useQuery< FlowState >( {
		queryKey: [ PREFIX, flow, session, VERSION ],
		...PERSISTENCE_CONFIG,
	} );

	function get< T extends keyof FlowState >( key: T ) {
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
		sessionId: session,
	};
}
