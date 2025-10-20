import { domainCanRedirect } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const domainCanRedirectQuery = ( siteId: number, domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domain-can-redirect', siteId, domainName ],
		queryFn: () => domainCanRedirect( siteId, domainName ),
	} );
