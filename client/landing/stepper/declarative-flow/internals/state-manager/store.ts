import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSessionId } from 'calypso/landing/stepper/utils/use-session-id';
import { StepperStep, FlowV2 } from '../types';
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

/**
 * This type is used to convert an array of steps to a record of step slugs to step state.
 * It's used to type the state of the flow. i.e it makes a Record of all the step slugs to the step state, making up the flow state.
 */
type ArrayToRecord< T extends readonly StepperStep[] > = {
	[ K in T[ number ][ 'slug' ] ]: Parameters<
		Parameters<
			Awaited< ReturnType< Extract< T[ number ], { slug: K } >[ 'asyncComponent' ] > >[ 'default' ]
		>[ 0 ][ 'navigation' ][ 'submit' ]
	>[ 0 ];
};

/**
 * This type is used to aggregate the state of a flow.
 * It loops all the steps in the flow and unions their types.
 */
type AggregatedFlowState< Flow extends FlowV2 > = ArrayToRecord<
	ReturnType< Flow[ 'initialize' ] >
>;

/**
 * Returns a setter and a getter for the flow state. This persists the state for 7 days. The persistence is based on the flow and the session ID.
 */
export function useFlowState< Flow extends FlowV2 >( flow: Flow ) {
	type FlowState = AggregatedFlowState< Flow >;

	const queryClient = useQueryClient();
	const flowName = flow.name;
	const session = getSessionId();

	const { data: state = {} as FlowState } = useQuery< FlowState >( {
		queryKey: [ PREFIX, flowName, session, VERSION ],
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
