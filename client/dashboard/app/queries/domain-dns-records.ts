import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
	fetchDomainDns,
	updateDomainDns,
	restoreDefaultEmailRecords,
	DnsRecord,
} from '../../data/domain-dns-records';
import { queryClient } from '../query-client';

export const domainDnsMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( params: {
			recordsToAdd?: DnsRecord[];
			recordsToRemove?: DnsRecord[];
			restoreDefaultARecords?: boolean;
		} ) =>
			updateDomainDns(
				domainName,
				params.recordsToAdd,
				params.recordsToRemove,
				params.restoreDefaultARecords
			),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'domains', domainName, 'dns' ],
			} );
		},
	} );

export const domainDnsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'dns' ],
		queryFn: () => fetchDomainDns( domainName ),
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
