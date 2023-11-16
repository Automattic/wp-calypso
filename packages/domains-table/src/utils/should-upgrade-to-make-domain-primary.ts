import { type as domainTypes } from './constants';
import { ResponseDomain } from './types';

interface Attributes {
	isDomainOnly: boolean;
	canSetPrimaryDomainForSite: boolean;
	userCanSetPrimaryDomains: boolean;
	isSiteOnFreePlan: boolean;
}

export const shouldUpgradeToMakeDomainPrimary = (
	domain: ResponseDomain,
	{
		isDomainOnly,
		isSiteOnFreePlan,
		userCanSetPrimaryDomains,
		canSetPrimaryDomainForSite,
	}: Attributes
) => {
	return (
		! userCanSetPrimaryDomains &&
		isSiteOnFreePlan &&
		( domain.type === domainTypes.REGISTERED || domain.type === domainTypes.MAPPED ) &&
		! isDomainOnly &&
		! domain.isPrimary &&
		! domain.isWPCOMDomain &&
		! domain.isWpcomStagingDomain &&
		! canSetPrimaryDomainForSite
	);
};
