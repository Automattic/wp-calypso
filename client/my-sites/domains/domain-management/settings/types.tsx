import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

type WhoisData = {
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
	selectedSite: SiteData;
};

export type SettingsPageConnectedProps = {
	currentRoute: string;
	domain: ResponseDomain | undefined;
	isLoadingPurchase: boolean;
	purchase: Purchase | null;
	whoisData: WhoisData[];
};

export type SettingsPageNameServerHocProps = {
	isLoadingNameservers: boolean;
	loadingNameserversError: boolean;
	nameservers: string[] | null;
	updateNameservers: ( nameServers: string[] ) => void;
};

export type SettingsPageConnectedDispatchProps = {
	requestWhois: ( domain: string ) => void;
	dns: any;
	isRequestingDomains: boolean;
};

export type SettingsHeaderProps = {
	domain: ResponseDomain;
};

export type SettingsPageProps = SettingsPagePassedProps &
	SettingsPageConnectedProps &
	SettingsPageConnectedDispatchProps &
	SettingsPageNameServerHocProps;
