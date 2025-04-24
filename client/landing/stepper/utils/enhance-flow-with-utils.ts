import type { FlowV2 } from '../declarative-flow/internals/types';

/**
 * Add utility functions to the flow object. This frees the API consumers from making these functions themselves.
 * @param flow the flow.
 * @returns the enhanced flow.
 */
export function enhanceFlowWithUtilityFunctions< T extends FlowV2< any > >( flow: T ): T {
	flow.getSteps = () => {
		return flow.__flowSteps ?? [];
	};
	return flow;
}
