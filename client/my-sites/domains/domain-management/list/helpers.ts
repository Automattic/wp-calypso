import { ResponseDomain } from 'calypso/lib/domains/types';

type FilterDomainsByOwnerType = (
	domains: Array< ResponseDomain >,
	filter: 'owned-by-me' | 'owned-by-others' | undefined
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
