import { useQuery } from './use-query';

export function useEmailVerifiedParam(): string | null {
	return useQuery().get( 'emailVerified' );
}
