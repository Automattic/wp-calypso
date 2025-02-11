import { DnsRequest, DnsRecord, ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDetails } from '@automattic/data-stores';

export type DnsDetailsProps = {
	dns: DnsRequest;
	selectedDomain: ResponseDomain;
	selectedDomainName: string;
	selectedSite: SiteDetails;
	currentRoute: string;
	showDetails?: boolean;
};

export type DnsRecordItemProps = {
	dnsRecord: DnsRecord;
	selectedDomainName: string;
};
