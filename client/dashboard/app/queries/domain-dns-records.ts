import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { fetchDomainDns, updateDomainDns, DnsRecord } from '../../data/domain-dns-records';
import { queryClient } from '../query-client';

export const domainDnsMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( data: {
			recordsToAdd?: DnsRecord[];
			recordsToRemove?: DnsRecord[];
			restoreDefaultARecords?: boolean;
		} ) =>
			updateDomainDns(
				domainName,
				data.recordsToAdd,
				data.recordsToRemove,
				data.restoreDefaultARecords
			),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'domains', domainName, 'domain-dns' ],
			} );
		},
	} );

export const domainDnsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'domain-dns' ],
		queryFn: () => fetchDomainDns( domainName ),
	} );
