import { ResponseDomain } from 'calypso/lib/domains/types';

type ResponseDomainAugmented = ResponseDomain & {
	isDomainOnlySite: boolean;
	siteSlug: string;
};

type FilterDomainsByOwnerType = (
	domains: Array< ResponseDomainAugmented >,
	filter: 'owned-by-me' | 'owned-by-others' | undefined
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
