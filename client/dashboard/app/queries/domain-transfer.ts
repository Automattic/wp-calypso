import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
	fetchIpsTagList,
	requestTransferCode,
	saveIpsTag,
	updateDomainLock,
	fetchDomainTransferRequest,
	updateDomainTransferRequest,
	deleteDomainTransferRequest,
	domainTransferToOtherUser,
} from '../../data/domain-transfer';
import { queryClient } from '../query-client';
import { domainQuery } from './domain';
import type { Domain } from '../../data/domain';

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
		queryFn: () => fetchDomainTransferRequest( domain, siteSlug ),
	} );

export const updateDomainTransferRequestMutation = ( domain: string, siteSlug: string ) =>
	mutationOptions( {
		mutationFn: ( email: string ) => updateDomainTransferRequest( domain, siteSlug, email ),
		onSuccess: ( _, email ) => {
			// Manually update the cache before invalidating the query
			queryClient.setQueryData( domainTransferRequestQuery( domain, siteSlug ).queryKey, {
				email,
				requested_at: new Date().toISOString(),
			} );
			queryClient.invalidateQueries( domainTransferRequestQuery( domain, siteSlug ) );
		},
	} );

export const deleteDomainTransferRequestMutation = ( domain: string, siteSlug: string ) =>
	mutationOptions( {
		mutationFn: () => deleteDomainTransferRequest( domain, siteSlug ),
		onSuccess: () => {
			// Manually update the cache before invalidating the query
			queryClient.setQueryData( domainTransferRequestQuery( domain, siteSlug ).queryKey, null );
			queryClient.invalidateQueries( domainTransferRequestQuery( domain, siteSlug ) );
		},
	} );

export const domainTransferToOtherUserMutation = (
	domain: string,
	siteId: number,
	userId: string
) =>
	mutationOptions( {
		mutationFn: () => domainTransferToOtherUser( domain, siteId, userId ),
	} );
