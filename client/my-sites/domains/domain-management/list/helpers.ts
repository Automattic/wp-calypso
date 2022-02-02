import { ResponseDomain } from 'calypso/lib/domains/types';

type FilterDomainsByOwnerType = (
	domains: Array< ResponseDomain >,
	filter: 'owned-by-me' | 'owned-by-others' | undefined
) => Array< ResponseDomain >;

type JSONValue =
	| string
	| number
	| boolean
	| null
	| { [ x: string ]: JSONValue }
	| Array< JSONValue >;

type Site = {
	[ key: string ]: JSONValue;
	options: {
		[ key: string ]: JSONValue;
		is_domain_only: boolean;
	};
};

type FilterDomainsDomainOnlyType = (
	domains: Array< ResponseDomain >,
	sites: Array< Site >
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

export const filterDomainsDomainOnly: FilterDomainsDomainOnlyType = ( domains, sites ) => {
	return domains.filter( ( domain: ResponseDomain ) => {
		return sites[ domain.blogId ].options.is_domain_only;
	} );
};
