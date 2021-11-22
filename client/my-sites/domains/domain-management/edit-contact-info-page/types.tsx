import { ResponseDomain } from 'calypso/lib/domains/types';

export type EditContactInfoPageProps = {
	domains: ResponseDomain[];
	selectedDomainName: string;
	// TODO: We should define the selectedSite object
	selectedSite: Record< string, unknown > | boolean;
};
