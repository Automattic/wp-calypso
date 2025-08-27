import { mutationOptions } from '@tanstack/react-query';
import { updateDNSSEC } from '../../data/domain-dnssec';
import { queryClient } from '../query-client';
import { domainQuery } from './domain';

export const domainDnssecMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: ( enabled: boolean ) => updateDNSSEC( domain, enabled ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domain ) );
		},
	} );
