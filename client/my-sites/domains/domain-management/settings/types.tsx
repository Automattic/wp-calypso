import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export type SettingsPagePassedProps = {
	currentRoute: string;
	domains: ResponseDomain[] | null;
	selectedDomainName: string;
	selectedSite: SiteData;
};

export type SettingsPageConnectedProps = {
	currentRoute: string;
	domain: ResponseDomain;
	isLoadingPurchase: boolean;
	purchase: Purchase | null;
};

export type SettingsHeaderProps = {
	domain: ResponseDomain;
};

export type SettingsPageProps = SettingsPagePassedProps & SettingsPageConnectedProps;
