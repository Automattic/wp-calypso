import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { Task } from '@automattic/launchpad';

interface APIFetchOptions {
	global: boolean;
	path: string;
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
	is_enabled: boolean;
	is_dismissed: boolean;
}

type LaunchpadUpdateSettings = {
	checklist_statuses?: Record< string, boolean >;
	is_checklist_dismissed?: {
		slug: string;
		is_dismissed: boolean;
	};
};

export const fetchLaunchpad = (
	siteSlug: string | null,
	checklist_slug?: string | 0 | null | undefined
): Promise< LaunchpadResponse > => {
	const slug = encodeURIComponent( siteSlug as string );
	const checklistSlug = checklist_slug ? encodeURIComponent( checklist_slug ) : null;
	const requestUrl = checklistSlug
		? `/sites/${ slug }/launchpad?_locale=user&checklist_slug=${ checklistSlug }`
		: `/sites/${ slug }/launchpad?_locale=user`;

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

const mapTask = ( task: Task, index: number ) => {
	task.order = index;
	return task;
};

export const useLaunchpad = (
	siteSlug: string | null,
	checklist_slug?: string | 0 | null | undefined
) => {
	const key = [ 'launchpad', siteSlug, checklist_slug ];
	return useQuery( {
		queryKey: key,
		queryFn: () =>
			fetchLaunchpad( siteSlug, checklist_slug ).then( ( data ) => {
				const tasks = data.checklist || [];
				const completedTasks = tasks.filter( ( task: Task ) => task.completed );
				const incompleteTasks = tasks.filter( ( task: Task ) => ! task.completed );
				data.checklist = [ ...completedTasks, ...incompleteTasks ].map( mapTask );

				return data;
			} ),
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

export const updateLaunchpadSettings = (
	siteSlug: string | number,
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
				data: settings,
		  } as APIFetchOptions );
};
