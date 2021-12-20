import { Dns, DnsRecord } from 'calypso/lib/domains/types';

export type DnsDetailsProps = {
	dns: Dns;
	isRequestingDomains: boolean;
	selectedDomainName: string;
};

export type DnsRecordItemProps = {
	dnsRecord: DnsRecord;
	selectedDomainName: string;
};
