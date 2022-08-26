import { useQuery } from './use-query';

export function usePostIdParam(): string | null {
	return useQuery().get( 'postId' );
}
