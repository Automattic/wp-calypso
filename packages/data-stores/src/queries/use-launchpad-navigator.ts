import { useQuery } from '@tanstack/react-query';
import apiFetch, { type APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

interface AvailableChecklist {
	slug: string;
	title: string;
}

interface AvailableChecklists {
	[ checklist_slug: string ]: AvailableChecklist;
}

interface LaunchpadNavigatorResponse {
	available_checklists: AvailableChecklists;
	current_checklist: string | null;
}

const defaultResponse: LaunchpadNavigatorResponse = {
	available_checklists: {},
	current_checklist: null,
};

export const fetchLaunchpadNavigator = (
	siteId: number | null
): Promise< LaunchpadNavigatorResponse > => {
	if ( ! siteId ) {
		return Promise.resolve( defaultResponse );
	}

	return canAccessWpcomApis()
		? wpcomRequest( {
				path: `/sites/${ siteId }/launchpad/navigator`,
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
		  } )
		: apiFetch( {
				global: true,
				path: `/wpcom/v2/launchpad/navigator`,
		  } as APIFetchOptions );
};

export const useLaunchpadNavigator = (
	siteId: number | null,
	current_checklist: string | null
) => {
	const key = [ 'launchpad-navigator', siteId, current_checklist ];

	return useQuery( {
		queryKey: key,
		queryFn: () => fetchLaunchpadNavigator( siteId ),
		retry: 3,
		initialData: defaultResponse,
	} );
};
