import { updateAgencySiteTags } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

// Pure mutation builder: callers invalidate the relevant site/list queries at
// the call site because the classic A4A app provides Calypso's own QueryClient
// rather than the `@automattic/api-queries` singleton.
export const agencySiteTagsMutation = ( agencyId: number | undefined ) =>
	mutationOptions( {
		meta: { statId: 'agcy-site-tags-update' },
		mutationFn: ( { siteId, tags }: { siteId: number; tags: string[] } ) => {
			if ( ! agencyId ) {
				throw new Error( 'No active agency found for the current user.' );
			}
			return updateAgencySiteTags( agencyId, siteId, tags );
		},
	} );
