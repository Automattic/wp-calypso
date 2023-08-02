import { type as domainTypes } from 'calypso/lib/domains/constants';
import { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDetails } from '@automattic/data-stores';
type FilterDomainsByOwnerType = (
	domains: Array< ResponseDomain >,
	filter: 'owned-by-me' | 'owned-by-others' | undefined
) => Array< ResponseDomain >;

type FilterDomainsDomainOnlyType = (
	domains: Array< ResponseDomain >,
	sites: Array< SiteDetails >
) => Array< ResponseDomain >;

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

export const filterDomainOnlyDomains: FilterDomainsDomainOnlyType = ( domains, sites ) => {
	return domains.filter( ( domain: ResponseDomain ) => {
		return domain.type === domainTypes.REGISTERED && sites[ domain.blogId ].options?.is_domain_only;
	} );
};
