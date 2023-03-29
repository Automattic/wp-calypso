import { useQuery } from './use-query';

export function useProviderParam(): string | null {
	return useQuery().get( 'provider' );
}
