import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

interface LaunchpadTask {
	id?: string;
	completed?: boolean;
	disabled?: boolean;
	title?: string;
	subtitle?: string;
	badgeText?: string;
	actionDispatch?: () => void;
	isLaunchTask?: boolean;
	warning?: boolean;
}

interface LaunchpadTasks {
	checklist: LaunchpadTask[];
}

export const fetchLaunchpadChecklist = (
	siteSlug: string | null,
	siteIntent: string
): Promise< LaunchpadTasks > => {
	const slug = encodeURIComponent( siteSlug as string );

	return canAccessWpcomApis()
		? wpcomRequest( {
				path: `sites/${ slug }/launchpad/checklist?checklist_slug=${ siteIntent }`,
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
		  } )
		: apiFetch( {
				global: true,
				path: `sites/${ slug }/launchpad/checklist?checklist_slug=${ siteIntent }`,
		  } as APIFetchOptions );
};

export const useLaunchpadChecklist = ( siteSlug: string | null, siteIntent: string ) => {
	const key = [ 'launchpad', siteSlug ];
	return useQuery( key, () => fetchLaunchpadChecklist( siteSlug, siteIntent ), {
		retry: 3,
		initialData: {
			checklist: [],
		},
	} );
};
