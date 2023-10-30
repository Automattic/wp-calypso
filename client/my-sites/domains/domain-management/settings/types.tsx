import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { SiteDetails } from '@automattic/data-stores';
import type { DnsRequest, ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';

export type WhoisData = {
	fname: string;
	lname: string;
	org: string;
	email: string;
	city: string;
	sp: string;
	pc: string;
	cc: string;
	phone: string;
	fax: string;
	sa1: string;
	sa2: string;
	country_code: string;
	state: string;
	type: string;
};

export type SettingsPagePassedProps = {
	currentRoute: string;
	domains: ResponseDomain[] | null;
	selectedDomainName: string;
	selectedSite: SiteDetails;
};

export type SettingsPageConnectedProps = {
	currentRoute: string;
	domain: ResponseDomain | undefined;
	isLoadingPurchase: boolean;
	purchase: Purchase | null;
	whoisData: WhoisData[];
	dns: DnsRequest;
	domainOnlySite: boolean | null;
};

export type SettingsPageNameServerHocProps = {
	isLoadingNameservers: boolean;
	loadingNameserversError: boolean;
	nameservers: string[] | null;
	updateNameservers: ( nameServers: string[] ) => void;
};

export type SettingsPageConnectedDispatchProps = {
	requestWhois: ( domain: string ) => void;
	recordTracksEvent: typeof recordTracksEvent;
};

export type SettingsPageProps = SettingsPagePassedProps &
	SettingsPageConnectedProps &
	SettingsPageConnectedDispatchProps &
	SettingsPageNameServerHocProps;
