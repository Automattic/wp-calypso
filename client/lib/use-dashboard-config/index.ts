import { queryOptions, useQuery } from '@tanstack/react-query';

export const DASHBOARD_TYPE = typeof window !== 'undefined' ? window.app?.dashboardType : undefined;

export const dashboardConfigQueryOptions = () => {
	return queryOptions( {
		queryKey: [ 'dashboard-config' ],
		queryFn: () => {
			if ( ! DASHBOARD_TYPE ) {
				throw new Error( 'Dashboard type not found' );
			}

			switch ( DASHBOARD_TYPE ) {
				case 'dotcom':
					return import( './dotcom' ).then( ( d ) => d.config );
				case 'ciab':
					return import( './ciab' ).then( ( d ) => d.config );
				default: {
					const exhaustiveCheck: never = DASHBOARD_TYPE;

					throw new Error(
						`Exhaustive check failed: ${ exhaustiveCheck }. Please handle this case.`
					);
				}
			}
		},
		enabled: !! DASHBOARD_TYPE,
		meta: {
			persist: false,
		},
	} );
};

export const useDashboardConfig = () => {
	return useQuery( dashboardConfigQueryOptions() ).data;
};
