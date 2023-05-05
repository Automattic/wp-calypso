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
	title: string;
	subtitle?: string;
	badgeText?: string;
	actionDispatch?: () => void;
	isLaunchTask?: boolean;
	warning?: boolean;
}

interface ChecklistStatuses {
	links_edited?: boolean;
	site_edited?: boolean;
	site_launched?: boolean;
	first_post_published?: boolean;
	video_uploaded?: boolean;
	publish_first_course?: boolean;
	plan_completed?: boolean;
	domain_upsell_deferred?: boolean;
}

interface LaunchpadResponse {
	site_intent?: string | null;
	launchpad_screen?: string | boolean | null | undefined;
	checklist?: Task[] | null;
	checklist_statuses?: ChecklistStatuses;
}

type LaunchpadUpdateSettings = {
	checklist_statuses?: Record< string, boolean >;
};

export const fetchLaunchpad = (
	siteSlug: string | null,
	checklist_slug?: string | null
): Promise< LaunchpadResponse > => {
	const slug = encodeURIComponent( siteSlug as string );
	const requestUrl = checklist_slug
		? `/sites/${ slug }/launchpad?checklist_slug=${ checklist_slug }`
		: `/sites/${ slug }/launchpad`;

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

export const useLaunchpad = ( siteSlug: string | null, checklist_slug?: string | null ) => {
	const key = [ 'launchpad', siteSlug, checklist_slug ];
	return useQuery( key, () => fetchLaunchpad( siteSlug, checklist_slug ), {
		retry: 3,
		initialData: {
			site_intent: '',
			launchpad_screen: undefined,
			checklist_statuses: {},
			checklist: null,
		},
	} );
};

export const updateLaunchpadSettings = (
	siteSlug: string | null,
	settings: LaunchpadUpdateSettings = {}
) => {
	const slug = encodeURIComponent( siteSlug as string );
	const requestUrl = `/sites/${ slug }/launchpad`;

	return canAccessWpcomApis()
		? wpcomRequest( {
				path: requestUrl,
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body: settings,
		  } )
		: apiFetch( {
				global: true,
				path: `/wpcom/v2${ requestUrl }`,
				method: 'PUT',
				data: { settings },
		  } as APIFetchOptions );
};
