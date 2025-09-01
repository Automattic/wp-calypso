import {
	fetchIpsTagList,
	requestTransferCode,
	saveIpsTag,
	updateDomainLock,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { domainQuery } from './domain';
import type { Domain } from '@automattic/api-core';

export const domainLockMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: ( enabled: boolean ) => updateDomainLock( domain, enabled ),
		onSuccess: ( _, enabled ) => {
			const oldDomain = queryClient.getQueryData( domainQuery( domain ).queryKey );
			queryClient.setQueryData( domainQuery( domain ).queryKey, {
				...oldDomain,
				is_locked: enabled,
			} as Domain );
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
		queryFn: () => fetchIpsTagList(),
	} );

export const ipsTagMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: ( ipsTag: string ) => saveIpsTag( domain, ipsTag ),
	} );
