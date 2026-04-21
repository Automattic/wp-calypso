import { queryOptions } from '@tanstack/react-query';

export const omnibarCurrentSiteIdQuery = () =>
	queryOptions( {
		queryKey: [ 'omnibar', 'current-site-id' ],
		queryFn: () => Promise.resolve< number | null >( null ),
		staleTime: Infinity,
		meta: { persist: false },
	} );
