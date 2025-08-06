import { mutationOptions } from '@tanstack/react-query';
import { addDNSRecord, DNSRecord } from '../../data/domain-dns-records';

export const domainAddDNSRecordMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: ( recordData: DNSRecord ) => addDNSRecord( domain, recordData ),
	} );
