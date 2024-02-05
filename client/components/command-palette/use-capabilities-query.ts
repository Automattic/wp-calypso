import { useQuery } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';

export const useCapabilitiesQuery = () =>
	useQuery( {
		queryKey: [ 'command-palette', 'capabilities' ],
		queryFn: () => {
			return request( {
				path: '/me/sites',
				apiVersion: '1.2',
				query: new URLSearchParams( {
					fields: 'ID,capabilities',
					site_visibility: 'all',
					site_activity: 'active',
					include_domain_only: 'true',
				} ).toString(),
			} );
		},
		select: ( data ) => {
			const capabilities = {};
			data.sites.forEach( ( site ) => {
				capabilities[ site.ID ] = site.capabilities;
			} );
			return capabilities;
		},
	} );
