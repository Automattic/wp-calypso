import { useQuery } from './use-query';

export function useSiteIdParam(): string | null {
	return useQuery().get( 'siteId' );
}
