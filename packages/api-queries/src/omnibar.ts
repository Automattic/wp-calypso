import { queryOptions } from '@tanstack/react-query';

export const omnibarSiteIdQuery = () =>
	queryOptions( {
		queryKey: [ 'omnibar', 'site-id' ],
		queryFn: () => Promise.resolve< number | null >( null ),
		staleTime: Infinity,
		meta: { persist: false },
	} );
