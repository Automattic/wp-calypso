import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import type { AgentStudioOutput } from '../types';

export const getAgentStudioOutputQueryKey = ( outputId: string ) => [
	'agent-studio-output',
	outputId,
];

type Options = Omit< UseQueryOptions< AgentStudioOutput | undefined >, 'queryKey' | 'queryFn' >;

export default function useAgentStudioOutput( outputId: string | undefined, options?: Options ) {
	return useQuery< AgentStudioOutput | undefined >( {
		queryKey: getAgentStudioOutputQueryKey( outputId ?? '' ),
		queryFn: () =>
			outputId ? agentStudioService.getOutput( outputId ) : Promise.resolve( undefined ),
		enabled: !! outputId,
		...options,
	} );
}
