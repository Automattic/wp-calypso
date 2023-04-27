import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

interface Task {
	id: string;
	completed: boolean;
	disabled: boolean;
	title?: string;
	subtitle?: string;
	badgeText?: string;
	actionDispatch?: () => void;
	isLaunchTask?: boolean;
	warning?: boolean;
}

interface LaunchpadTasks {
	checklist: Task[];
}

export const fetchLaunchpadChecklist = (
	siteSlug: string | null,
	siteIntent: string | null | undefined
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

export const useLaunchpadChecklist = (
	siteSlug: string | null,
	siteIntent: string | null | undefined
) => {
	const key = [ 'launchpad-checklist', siteSlug ];
	const queryResult = useQuery( key, () => fetchLaunchpadChecklist( siteSlug, siteIntent ), {
		retry: 3,
		initialData: {
			checklist: [],
		},
	} );

	// Typescript is returning the type "T | undefined" for useQuery,
	// regardless of initialData or placeholderData. Because of this, we
	// need to narrow the return type ourselves, which is why we have
	// the ternary we do below.
	// https://github.com/TanStack/query/discussions/1331#discussioncomment-809549
	const data = queryResult.isSuccess ? queryResult.data : { checklist: [] };
	return { ...queryResult, data };
};
