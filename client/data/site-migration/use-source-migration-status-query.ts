import { SourceSiteMigrationDetails } from '@automattic/data-stores/src/site';
import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { SiteId, SiteSlug } from 'calypso/types';

export const useSourceMigrationStatusQuery = (
	sourceIdOrSlug: SiteId | SiteSlug | null | undefined
) => {
	return useQuery( {
		queryKey: [ 'source-migration-status', sourceIdOrSlug ],
		queryFn: (): Promise< SourceSiteMigrationDetails > =>
			wp.req.get( {
				path: '/migrations/from-source/' + encodeURIComponent( sourceIdOrSlug as string ),
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		enabled: !! sourceIdOrSlug,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
