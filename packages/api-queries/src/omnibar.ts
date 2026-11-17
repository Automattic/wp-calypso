import { queryOptions } from '@tanstack/react-query';

export const omnibarSiteIdQuery = () =>
	queryOptions( {
		queryKey: [ 'omnibar', 'site-id' ],
		queryFn: () => Promise.resolve< number | null >( null ),
		initialData: null,
		staleTime: Infinity,
		meta: { persist: false },
	} );

/**
 * A link back to the page the user is on, usable from another app.
 * Written by the host app; `null` when the host does not publish it.
 */
export const omnibarCurrentUrlQuery = () =>
	queryOptions( {
		queryKey: [ 'omnibar', 'current-url' ],
		queryFn: () => Promise.resolve< string | null >( null ),
		initialData: null,
		staleTime: Infinity,
		meta: { persist: false },
	} );

export const omnibarAgentsManagerEnabledQuery = () =>
	queryOptions( {
		queryKey: [ 'omnibar', 'agents-manager-enabled' ],
		queryFn: () => Promise.resolve( false ),
		staleTime: Infinity,
		meta: { persist: false },
	} );
