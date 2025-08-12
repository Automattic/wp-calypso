import { mutationOptions } from '@tanstack/react-query';
import { addDNSRecord, DnsRecord } from '../../data/domain-dns-records';

export const domainAddDNSRecordMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: ( recordData: DnsRecord ) => addDNSRecord( domain, recordData ),
	} );
