import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

export interface APIFetchOptions {
	global: boolean;
	path: string;
}

interface LaunchpadNavigatorResponse {
	available_checklists: string[];
	current_checklist: string | null;
}

export const fetchLaunchpadNavigator = (
	siteSlug: string | null
): Promise< LaunchpadNavigatorResponse > => {
	const slug = encodeURIComponent( siteSlug as string );

	return canAccessWpcomApis()
		? wpcomRequest( {
				path: `/sites/${ slug }/launchpad/navigator`,
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
		  } )
		: apiFetch( {
				global: true,
				path: `/wpcom/v2/launchpad/navigator`,
		  } as APIFetchOptions );
};

export const useLaunchpadNavigator = ( siteSlug: string | null, current_checklist: string ) => {
	const key = [ 'launchpad-navigator', siteSlug, current_checklist ];

	return useQuery( {
		queryKey: key,
		queryFn: () => fetchLaunchpadNavigator( siteSlug ),
		retry: 3,
		initialData: {
			available_checklists: [],
			current_checklist: null,
		},
	} );
};
