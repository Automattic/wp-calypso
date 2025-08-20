import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
	fetchDomainDns,
	updateDomainDns,
	restoreDefaultEmailRecords,
	type DnsRecord,
	applyDnsTemplate,
	type DnsTemplateVariables,
} from '../../data/domain-dns-records';
import { queryClient } from '../query-client';

export const domainDnsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'dns' ],
		queryFn: () => fetchDomainDns( domainName ),
	} );

export const domainDnsMutation = ( domainName: string ) =>
	mutationOptions( {
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
		mutationFn: () => restoreDefaultEmailRecords( domainName ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'domains', domainName, 'dns' ],
			} );
		},
	} );

export const domainDnsApplyTemplateMutation = ( domainName: string ) =>
	mutationOptions( {
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
			queryClient.invalidateQueries( {
				queryKey: [ 'domains', domainName, 'dns' ],
			} );
		},
	} );
