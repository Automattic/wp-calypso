import { useQuery } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';

export const useSitesSortingQuery = () =>
	useQuery( {
		queryKey: [ 'command-palette', 'sites-sorting' ],
		queryFn: () =>
			request( {
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
