import {
	fetchDomainDns,
	updateDomainDns,
	restoreDefaultEmailRecords,
	type DnsRecord,
	applyDnsTemplate,
	type DnsTemplateVariables,
	importDnsBind,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const domainDnsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'dns' ],
		queryFn: () => fetchDomainDns( domainName ),
	} );

export const domainDnsMutation = ( domainName: string ) =>
	mutationOptions( {
		meta: { statId: 'domain-dns-update' },
		mutationFn: ( {
			recordsToAdd,
			recordsToRemove,
			restoreDefaultARecords,
		}: {
			recordsToAdd?: DnsRecord[];
			recordsToRemove?: DnsRecord[];
			restoreDefaultARecords?: boolean;
		} ) => updateDomainDns( domainName, recordsToAdd, recordsToRemove, restoreDefaultARecords ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainDnsQuery( domainName ) );
		},
	} );

export const domainDnsEmailMutation = ( domainName: string ) =>
	mutationOptions( {
		meta: { statId: 'domain-dns-email-restore' },
		mutationFn: () => restoreDefaultEmailRecords( domainName ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'domains', domainName, 'dns' ],
			} );
		},
	} );

export const domainDnsApplyTemplateMutation = ( domainName: string ) =>
	mutationOptions( {
		meta: { statId: 'domain-dns-tmpl-apply' },
		mutationFn: ( {
			provider,
			service,
			variables,
		}: {
			provider: string;
			service: string;
			variables: DnsTemplateVariables;
		} ) => applyDnsTemplate( domainName, provider, service, variables ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainDnsQuery( domainName ) );
		},
	} );

export const domainDnsImportBindMutation = ( domainName: string ) =>
	mutationOptions( {
		meta: { statId: 'domain-dns-bind-import' },
		mutationFn: ( file: File ) => importDnsBind( domainName, file ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainDnsQuery( domainName ) );
		},
	} );
