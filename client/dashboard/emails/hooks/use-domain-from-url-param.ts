import { domainQuery, siteByIdQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

export const useDomainFromUrlParam = () => {
	const router = useRouter();
	// Extract params from the current match for this route
	const match = router.state.matches[ router.state.matches.length - 1 ];
	const params = ( match?.params ?? {} ) as { domain?: string; type?: string };
	const { domain: domainName = '' } = params;
	const {
		data: domain,
		isFetched: isDomainFetched,
		isLoading: isLoadingDomain,
	} = useSuspenseQuery( domainQuery( domainName ) );

	const { data: site } = useQuery( siteByIdQuery( domain.blog_id ) );

	useEffect( () => {
		if ( isDomainFetched && ! domain ) {
			router.navigate( { to: '/emails' } );
		}
	}, [ domain, isDomainFetched, router ] );

	return {
		domain,
		domainName,
		isDomainFetched,
		isLoadingDomain,
		site,
	};
};
