import { type as domainTypes } from 'calypso/lib/domains/constants';
import { ResponseDomain } from 'calypso/lib/domains/types';

type AllDomainsDomainType = {
	isDomainOnlySite: boolean;
	siteSlug: string;
};

type FilterDomainsByOwnerType = (
	domains: Array< ResponseDomain & AllDomainsDomainType >,
	filter: 'owned-by-me' | 'owned-by-others' | undefined
) => Array< ResponseDomain & AllDomainsDomainType >;

type FilterDomainsDomainOnlyType = (
	domains: Array< ResponseDomain & AllDomainsDomainType >
) => Array< ResponseDomain & AllDomainsDomainType >;

export const filterDomainsByOwner: FilterDomainsByOwnerType = ( domains, filter ) => {
	return domains.filter( ( domain ) => {
		if ( 'owned-by-me' === filter ) {
			return domain.currentUserIsOwner;
		} else if ( 'owned-by-others' === filter ) {
			return ! domain.currentUserIsOwner;
		}
		return true;
	} );
};

export const filterDomainOnlyDomains: FilterDomainsDomainOnlyType = ( domains ) => {
	return domains.filter( ( domain ) => {
		return domain.type === domainTypes.REGISTERED && domain.isDomainOnlySite;
	} );
};
