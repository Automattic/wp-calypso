import { fetchSiteRedirect } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteRedirectQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'redirect' ],
		queryFn: () => fetchSiteRedirect( siteId ),
	} );
