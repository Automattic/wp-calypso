import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

export interface APIFetchOptions {
	global: boolean;
	path: string;
}

interface LaunchpadNavigatorResponse {
	available_checklists: string[];
	current_checklist: string;
}

export const fetchLaunchpadNavigator = (
	siteSlug: string | null
): Promise< LaunchpadNavigatorResponse > => {
	const slug = encodeURIComponent( siteSlug as string );
	const requestUrl = `/sites/${ slug }/launchpad/navigator`;

	return canAccessWpcomApis()
		? wpcomRequest( {
				path: requestUrl,
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
		  } )
		: apiFetch( {
				global: true,
				path: `/wpcom/v2${ requestUrl }`,
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
			current_checklist: '',
		},
	} );
};
