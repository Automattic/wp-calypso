import { SourceSiteMigrationDetails } from '@automattic/data-stores/src/site';
import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';
import type { SiteId } from 'calypso/types';

export const useSourceMigrationStatusQuery = ( sourceId: SiteId | undefined ) => {
	return useQuery(
		[ 'source-migration-status', sourceId ],
		(): Promise< SourceSiteMigrationDetails > =>
			wp.req.get( {
				path: '/migrations/from-source/' + encodeURIComponent( sourceId as number ),
				apiNamespace: 'wpcom/v2',
			} ),
		{
			meta: {
				persist: false,
			},
			enabled: !! sourceId,
		}
	);
};
