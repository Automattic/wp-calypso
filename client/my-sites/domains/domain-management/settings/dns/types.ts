import { Dns, DnsRecord } from 'calypso/lib/domains/types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export type DnsDetailsProps = {
	dns: Dns;
	isRequestingDomains: boolean;
	selectedDomainName: string;
	selectedSite: SiteData;
	currentRoute: string;
};

export type DnsRecordItemProps = {
	dnsRecord: DnsRecord;
	selectedDomainName: string;
};
