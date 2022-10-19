import { useQuery } from './use-query';

export function useFlowParam(): string | null {
	return useQuery().get( 'flow' );
}
