import { mutationOptions } from '@tanstack/react-query';
import { updateDNSSEC } from '../../data/domain-dnssec';
import { queryClient } from '../query-client';
import { siteDomainsQuery } from './site-domains';

export const domainDnssecMutation = ( domain: string, siteId: number ) =>
	mutationOptions( {
		mutationFn: ( enabled: boolean ) => updateDNSSEC( domain, enabled ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteDomainsQuery( siteId ) );
		},
	} );
