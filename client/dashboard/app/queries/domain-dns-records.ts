import { mutationOptions } from '@tanstack/react-query';
import { updateDomainDns, DnsRecord } from '../../data/domain-dns-records';

export const domainDnsMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: (
			recordsToAdd?: DnsRecord[],
			recordsToRemove?: DnsRecord[],
			restoreDefaultARecords?: boolean
		) => updateDomainDns( domainName, recordsToAdd, recordsToRemove, restoreDefaultARecords ),
	} );
