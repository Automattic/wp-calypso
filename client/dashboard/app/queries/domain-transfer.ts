import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { getIpsTagList, requestTransferCode, updateDomainLock } from '../../data/domain-transfer';
import { queryClient } from '../query-client';
import { domainQuery } from './domain';

export const domainLockMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: ( enabled: boolean ) => updateDomainLock( domain, enabled ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domain ) );
		},
	} );

export const domainTransferCodeMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: () => requestTransferCode( domain ),
	} );

export const ipsTagListQuery = () =>
	queryOptions( {
		queryKey: [ 'ips-tag-list' ],
		queryFn: () => getIpsTagList(),
	} );
