import type { SiteDetails } from '@automattic/data-stores';
export type DomainOnlyConnectCardPassedProps = {
	selectedSite: SiteDetails;
	selectedDomainName: string;
};

export type DomainOnlyConnectCardConnectedProps = {
	currentRoute?: string;
};

export type DomainOnlyConnectCardProps = DomainOnlyConnectCardPassedProps &
	DomainOnlyConnectCardConnectedProps;
