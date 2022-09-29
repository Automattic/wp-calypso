import { useQuery } from './use-query';

export function useVerifiedParam(): string | null {
	return useQuery().get( 'verified' );
}
