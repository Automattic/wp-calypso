import type { SiteDetails } from '@automattic/data-stores';
export type DomainOnlyConnectCardPassedProps = {
	selectedSite: SiteDetails;
	selectedDomainName: string;
	hasConnectableSites: boolean;
};

export type DomainOnlyConnectCardConnectedProps = {
	currentRoute?: string;
};

export type DomainOnlyConnectCardProps = DomainOnlyConnectCardPassedProps &
	DomainOnlyConnectCardConnectedProps;
