import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export type DomainStatusCardPassedProps = {
	selectedSite: SiteData;
	selectedDomainName: string;
};

export type DomainStatusCardConnectedProps = {
	currentRoute?: string;
};

export type DomainStatusCardProps = DomainStatusCardPassedProps & DomainStatusCardConnectedProps;
