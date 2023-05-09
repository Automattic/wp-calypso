import { useQuery } from './use-query';

export function useSiteSlugParam(): string | null {
	return useQuery().get( 'siteSlug' );
}
