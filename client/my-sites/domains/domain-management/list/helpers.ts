import { type as domainTypes } from 'calypso/lib/domains/constants';
import { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDetails } from '@automattic/data-stores';

type ResponseDomainAugmented = ResponseDomain & {
	isDomainOnlySite: boolean;
	siteSlug: string;
};

type FilterDomainsByOwnerType = (
	domains: Array< ResponseDomainAugmented >,
	filter: 'owned-by-me' | 'owned-by-others' | undefined
) => Array< ResponseDomainAugmented >;

type FilterDomainsDomainOnlyType = (
	domains: Array< ResponseDomainAugmented >,
	sites: Array< SiteDetails >
) => Array< ResponseDomainAugmented >;

export const filterDomainsByOwner: FilterDomainsByOwnerType = ( domains, filter ) => {
	return domains.filter( ( domain: ResponseDomain ) => {
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
