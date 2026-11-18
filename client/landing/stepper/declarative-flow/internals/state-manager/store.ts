import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { getSessionId } from 'calypso/landing/stepper/utils/use-session-id';
import type { AsyncStepperStep, DefaultFlowStepsConfig, FlowStepsState } from '../types';
import type { StepperMiscellaneousFields } from './stepper-state-manifest';

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
 * For hooks and steps shared between flows, which can't know which flow they're running in.
 */
export type AnyFlowInitialize = () => AsyncStepperStep[];

type KnownFlowStateKey< FlowStepsInitialize extends DefaultFlowStepsConfig > = Extract<
	keyof FlowStepsState< FlowStepsInitialize > | keyof StepperMiscellaneousFields,
	string
>;

/**
 * The keys of the flow's steps and the miscellaneous fields keep their types. Any other key holds `unknown`.
 */
export type FlowStateKey< FlowStepsInitialize extends DefaultFlowStepsConfig > =
	KnownFlowStateKey< FlowStepsInitialize > | ( string & {} );

export type FlowStateValue<
	FlowStepsInitialize extends DefaultFlowStepsConfig,
	Key extends string,
> = Key extends keyof FlowStepsState< FlowStepsInitialize >
	? FlowStepsState< FlowStepsInitialize >[ Key ]
	: Key extends keyof StepperMiscellaneousFields
		? StepperMiscellaneousFields[ Key ]
		: unknown;

export type FlowState< FlowStepsInitialize extends DefaultFlowStepsConfig > = Partial<
	FlowStepsState< FlowStepsInitialize >
> &
	StepperMiscellaneousFields &
	Record< string, unknown >;

/**
 * Without a type argument, `useFlowState` asks for one through this argument instead of
 * falling back to untyped steps.
 */
type RequireFlowStepsInitialize< FlowStepsInitialize > = [ FlowStepsInitialize ] extends [ never ]
	? [ missingTypeArgument: 'Pass the flow steps type: useFlowState< typeof initialize >()' ]
	: [];

const DEFAULT_STATE = {};

/**
 * Returns a setter and a getter for the flow state. This persists the state for 7 days. The persistence is based on the flow and the session ID.
 * @example useFlowState< typeof initialize >()
 */
export function useFlowState< FlowStepsInitialize extends DefaultFlowStepsConfig = never >(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	..._requireTypeArgument: RequireFlowStepsInitialize< FlowStepsInitialize >
) {
	const queryClient = useQueryClient();
	const flow = getFlowFromURL() || 'flow';
	const session = getSessionId();
	const queryKey = useMemo( () => [ PREFIX, flow, session, VERSION ] as const, [ flow, session ] );
	const state: FlowState< FlowStepsInitialize > =
		queryClient.getQueryData< FlowState< FlowStepsInitialize > >( queryKey ) ?? DEFAULT_STATE;

	useEffect( () => {
		queryClient.setQueryDefaults( queryKey, PERSISTENCE_CONFIG );
	}, [ queryClient, queryKey ] );

	function get< Key extends FlowStateKey< FlowStepsInitialize > >(
		key: Key
	): FlowStateValue< FlowStepsInitialize, Key > | undefined {
		return state[ key ] as FlowStateValue< FlowStepsInitialize, Key > | undefined;
	}

	function set< Key extends FlowStateKey< FlowStepsInitialize > >(
		key: Key,
		value: FlowStateValue< FlowStepsInitialize, Key >
	): FlowStateValue< FlowStepsInitialize, Key > {
		queryClient.setQueryData( [ PREFIX, flow, session, VERSION ], {
			...state,
			[ key ]: value,
		} );

		return value;
	}

	return {
		get,
		set,
		sessionId: session,
		queryKey,
	};
}
