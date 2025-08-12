import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { fetchDomainDns, updateDomainDns, DnsRecord } from '../../data/domain-dns-records';

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
	} );

export const domainDnsQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'domain-dns' ],
		queryFn: () => fetchDomainDns( domainName ),
	} );
