import { DnsRequest, DnsRecord } from 'calypso/lib/domains/types';
import type { SiteDetails } from '@automattic/data-stores';
export type DnsDetailsProps = {
	dns: DnsRequest;
	selectedDomainName: string;
	selectedSite: SiteDetails;
	currentRoute: string;
};

export type DnsRecordItemProps = {
	dnsRecord: DnsRecord;
	selectedDomainName: string;
};
