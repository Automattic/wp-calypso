import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export type DomainOnlyConnectCardPassedProps = {
	selectedSite: SiteData;
	selectedDomainName: string;
};

export type DomainOnlyConnectCardConnectedProps = {
	currentRoute?: string;
};

export type DomainOnlyConnectCardProps = DomainOnlyConnectCardPassedProps &
	DomainOnlyConnectCardConnectedProps;
