import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

interface LaunchpadNavigatorResponse {
	available_checklists: string[];
	current_checklist: string;
}

interface UseLaunchpadNavigatorOptions {
	onSuccess?: ( data: LaunchpadNavigatorResponse ) => LaunchpadNavigatorResponse;
}

const defaultSuccessCallback = ( response: LaunchpadNavigatorResponse ) => response;

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

export const useLaunchpadNavigator = (
	siteSlug: string | null,
	options?: UseLaunchpadNavigatorOptions
) => {
	const key = [ 'launchpad-navigator', siteSlug ];
	const onSuccessCallback = options?.onSuccess || defaultSuccessCallback;

	return useQuery( {
		queryKey: key,
		queryFn: () => fetchLaunchpadNavigator( siteSlug ).then( onSuccessCallback ),
		retry: 3,
		initialData: {
			site_intent: '',
			launchpad_screen: undefined,
			checklist_statuses: {},
			checklist: null,
			is_enabled: false,
			is_dismissed: false,
		},
	} );
};

/**
 * Updates the current task list in progress.
 */
export const updateLaunchpadCurrentTaskList = (
	siteSlug: string | number,
	checklistSlug: string
) => {
	const slug = encodeURIComponent( siteSlug as string );
	const requestUrl = `/sites/${ slug }/launchpad/navigator`;
	const body = {
		checklist_slug: checklistSlug,
	};
	const currentChecklistSlug = '';

	if ( currentChecklistSlug === checklistSlug ) {
		return Promise.resolve();
	}

	return canAccessWpcomApis()
		? wpcomRequest( {
				path: requestUrl,
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body,
		  } )
		: apiFetch( {
				global: true,
				path: `/wpcom/v2${ requestUrl }`,
				method: 'PUT',
				data: body,
		  } as APIFetchOptions );
};
