import { fetchSiteRedirect } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteRedirectQuery = ( siteSlug: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteSlug, 'redirect' ],
		queryFn: () => fetchSiteRedirect( siteSlug ),
	} );
