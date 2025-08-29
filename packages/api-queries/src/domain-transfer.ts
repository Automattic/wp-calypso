import {
	fetchIpsTagList,
	requestTransferCode,
	saveIpsTag,
	updateDomainLock,
	getDomainTransferRequest,
	domainTransferRequestUpdate,
	domainTransferRequestDelete,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { domainQuery } from './domain';
import { queryClient } from './query-client';
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

export const domainTransferRequestQuery = ( domain: string, siteSlug: string ) =>
	queryOptions( {
		queryKey: [ 'domain-transfer-request', domain, siteSlug ],
		queryFn: () => getDomainTransferRequest( domain, siteSlug ),
	} );

export const domainTransferRequestUpdateMutation = ( domain: string, siteSlug: string ) =>
	mutationOptions( {
		mutationFn: ( email: string ) => domainTransferRequestUpdate( domain, siteSlug, email ),
		onSuccess: ( _, email ) => {
			// Manually update the cache before invalidating the query
			queryClient.setQueryData( domainTransferRequestQuery( domain, siteSlug ).queryKey, {
				email,
				requested_at: new Date().toISOString(),
			} );
			queryClient.invalidateQueries( domainTransferRequestQuery( domain, siteSlug ) );
		},
	} );

export const domainTransferRequestDeleteMutation = ( domain: string, siteSlug: string ) =>
	mutationOptions( {
		mutationFn: () => domainTransferRequestDelete( domain, siteSlug ),
		onSuccess: () => {
			// Manually update the cache before invalidating the query
			queryClient.setQueryData( domainTransferRequestQuery( domain, siteSlug ).queryKey, null );
			queryClient.removeQueries( domainTransferRequestQuery( domain, siteSlug ) );
		},
	} );
