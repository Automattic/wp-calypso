import {
	fetchIpsTagList,
	requestTransferCode,
	saveIpsTag,
	updateDomainLock,
	fetchDomainTransferRequest,
	updateDomainTransferRequest,
	deleteDomainTransferRequest,
	domainTransferToUser,
	transferDomainToSite,
	fetchDomainInboundTransferStatus,
	startDomainInboundTransfer,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { domainQuery } from './domain';
import { domainsQuery } from './domains';
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
		queryKey: [ 'domains', domain, 'domain-transfer-request', siteSlug ],
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

export const domainTransferToUserMutation = ( domain: string, siteId: number ) =>
	mutationOptions( {
		mutationFn: ( userId: string ) => domainTransferToUser( domain, siteId, userId ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainsQuery() );
		},
	} );

export const transferDomainToSiteMutation = ( domain: string, siteId: number ) =>
	mutationOptions( {
		mutationFn: ( targetSiteId: number ) => transferDomainToSite( domain, siteId, targetSiteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domain ) );
		},
	} );

export const domainInboundTransferStatusQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'inbound-transfer-status' ],
		queryFn: () => fetchDomainInboundTransferStatus( domainName ),
	} );

export const startDomainInboundTransferMutation = ( domain: string, siteId: number ) =>
	mutationOptions( {
		mutationFn: ( authCode: string ) => startDomainInboundTransfer( siteId, domain, authCode ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domain ) );
			queryClient.invalidateQueries( domainInboundTransferStatusQuery( domain ) );
			queryClient.invalidateQueries( domainsQuery() );
		},
	} );
