import { useQuery } from './use-query';

export function useDomainParam(): string | null {
	return useQuery().get( 'domain' );
}
