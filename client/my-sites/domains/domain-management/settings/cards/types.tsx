import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';

export type DetailsCardProps = {
	domain: ResponseDomain;
	isLoadingPurchase: boolean;
	purchase: Purchase | null;
	selectedSite: SiteDetails;
};

export type SecurityCardProps = DetailsCardProps & {
	isDisabled: boolean;
};

export type NameServersCardProps = {
	domain: ResponseDomain;
	isLoadingNameservers?: boolean;
	isRequestingSiteDomains?: boolean;
	loadingNameserversError: boolean;
	nameservers: string[] | null;
	selectedDomainName: string;
	selectedSite: SiteDetails;
	updateNameservers: ( nameServers: string[] ) => void;
};

export type NameServersToggleProps = {
	enabled: boolean;
	onToggle: () => void;
	selectedDomainName: string;
};
