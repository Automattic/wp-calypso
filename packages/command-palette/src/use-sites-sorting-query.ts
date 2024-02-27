import { useQuery } from '@tanstack/react-query';
import type { WPCOM } from 'wpcom';

export const useSitesSortingQuery = ( wpcom: WPCOM ) =>
	useQuery( {
		queryKey: [ 'command-palette', 'sites-sorting' ],
		queryFn: () =>
			wpcom.req.get( {
				path: '/me/preferences',
				apiVersion: '1.1',
			} ),
		select: ( data ) => {
			const serializedSitesSorting =
				data?.calypso_preferences?.[ 'sites-sorting' ] ?? 'lastInteractedWith-desc';
			const [ sortKey, sortOrder ] = serializedSitesSorting.split( '-' );
			return {
				sortKey,
				sortOrder,
			};
		},
		initialData: {
			sortKey: 'lastInteractedWith',
			sortOrder: 'desc',
		},
	} );
