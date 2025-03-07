import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
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
	order?: number;
}

export interface ChecklistStatuses {
	links_edited?: boolean;
	site_edited?: boolean;
	site_launched?: boolean;
	first_post_published?: boolean;
	video_uploaded?: boolean;
	publish_first_course?: boolean;
	plan_selected?: boolean;
	plan_completed?: boolean;
	domain_upsell_deferred?: boolean;
}

type LaunchpadScreen = 'full' | 'off' | 'skipped' | 'minimized';

export interface LaunchpadResponse {
	site_intent?: string | null;
	launchpad_screen?: LaunchpadScreen | boolean | null | undefined;
	checklist?: Task[] | null;
	checklist_statuses?: ChecklistStatuses;
	is_enabled: boolean;
	is_dismissed: boolean;
	is_dismissible: boolean;
	title?: string | null;
}

type LaunchpadUpdateSettings = {
	checklist_statuses?: Record< string, boolean >;
	is_checklist_dismissed?: {
		slug: string;
		is_dismissed?: boolean;
		dismissed_until?: number | null;
	};
	launchpad_screen?: 'off' | 'minimized' | 'full' | 'skipped';
};

export type UseLaunchpadOptions = {
	onSuccess?: ( data: LaunchpadResponse ) => LaunchpadResponse;
};

export const fetchLaunchpad = (
	siteSlug: SiteSlug,
	checklistSlug?: string | null,
	launchpadContext?: string
): Promise< LaunchpadResponse > => {
	const slug = encodeURIComponent( siteSlug as string );
	const checklistSlugEncoded = checklistSlug ? encodeURIComponent( checklistSlug ) : null;
	const launchpadContextEncoded = launchpadContext ? encodeURIComponent( launchpadContext ) : null;
	const queryArgs = {
		_locale: 'user',
		...( checklistSlug && { checklist_slug: checklistSlugEncoded } ),
		...( launchpadContext && { launchpad_context: launchpadContextEncoded } ),
	};

	return canAccessWpcomApis()
		? wpcomRequest( {
				path: addQueryArgs( `/sites/${ slug }/launchpad`, queryArgs ),
				apiNamespace: 'wpcom/v2',
				method: 'GET',
		  } )
		: apiFetch( {
				global: true,
				path: addQueryArgs( `/wpcom/v2/launchpad`, queryArgs ),
		  } as APIFetchOptions );
};

const getKey = ( siteSlug: SiteSlug, checklistSlug?: string | null ) => {
	return [ 'launchpad', siteSlug, checklistSlug ];
};

const addOrderToTask = ( task: Task, index: number ) => {
	task.order = index;
	return task;
};

export function sortLaunchpadTasksByCompletionStatus( response: LaunchpadResponse ) {
	const tasks = response.checklist || [];
	const completedTasks = tasks.filter( ( task: Task ) => task.completed );
	const incompleteTasks = tasks.filter( ( task: Task ) => ! task.completed );
	response.checklist = [ ...completedTasks, ...incompleteTasks ].map( addOrderToTask );
	return response;
}

const defaultSuccessCallback = ( response: LaunchpadResponse ) => {
	const tasks = response.checklist || [];
	response.checklist = tasks.map( addOrderToTask );

	return response;
};

type SiteSlug = string | number | null;

export const useLaunchpad = (
	siteSlug: SiteSlug,
	checklistSlug?: string | null,
	options?: UseLaunchpadOptions,
	launchpad_context?: string | undefined
) => {
	const key = getKey( siteSlug, checklistSlug );
	const onSuccessCallback = options?.onSuccess || defaultSuccessCallback;

	return useQuery( {
		queryKey: key,
		queryFn: () =>
			fetchLaunchpad( siteSlug, checklistSlug, launchpad_context ).then( onSuccessCallback ),
		retry: 3,
		initialData: {
			site_intent: '',
			launchpad_screen: undefined,
			checklist_statuses: {},
			checklist: null,
			is_enabled: false,
			is_dismissed: false,
			is_dismissible: false,
			title: null,
		},
		enabled: Boolean( siteSlug ),
	} );
};

export const useSortedLaunchpadTasks = (
	siteSlug: SiteSlug,
	checklistSlug?: string | null,
	launchpadContext?: string
) => {
	const launchpadOptions = {
		onSuccess: sortLaunchpadTasksByCompletionStatus,
	};

	return useLaunchpad( siteSlug, checklistSlug, launchpadOptions, launchpadContext );
};

export const updateLaunchpadSettings = (
	siteSlug: SiteSlug,
	settings: LaunchpadUpdateSettings = {}
) => {
	const slug = siteSlug ? encodeURIComponent( siteSlug ) : null;

	return canAccessWpcomApis()
		? wpcomRequest( {
				path: `/sites/${ slug }/launchpad`,
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body: settings,
		  } )
		: apiFetch( {
				global: true,
				path: `/wpcom/v2/launchpad`,
				method: 'PUT',
				data: settings,
		  } as APIFetchOptions );
};

export interface PermanentDismiss {
	isDismissed: boolean;
}
export interface TemporaryDismiss {
	dismissBy: '+ 1 day' | '+ 1 week';
}

type DismissSettings = PermanentDismiss | TemporaryDismiss;

const isPermanentDismiss = ( settings: DismissSettings ): settings is PermanentDismiss =>
	'isDismissed' in settings;

const isTemporaryDismiss = ( settings: DismissSettings ): settings is TemporaryDismiss =>
	'dismissBy' in settings;

const getDismissParams = ( settings: DismissSettings ) => {
	if ( isPermanentDismiss( settings ) ) {
		return {
			is_dismissed: settings.isDismissed,
		};
	}

	if ( isTemporaryDismiss( settings ) ) {
		return {
			dismiss_by: settings.dismissBy,
		};
	}
};

export const useLaunchpadDismisser = (
	siteSlug: SiteSlug,
	checklistSlug: string,
	launchpadContext: string
) => {
	const queryClient = useQueryClient();
	const key = getKey( siteSlug, checklistSlug );

	return useMutation( {
		mutationFn: ( settings: DismissSettings ) => {
			return updateLaunchpadSettings( siteSlug, {
				is_checklist_dismissed: {
					slug: checklistSlug,
					...getDismissParams( settings ),
				},
			} );
		},
		onMutate: async () => {
			await queryClient.cancelQueries( { queryKey: key } );
			const previous = queryClient.getQueryData< LaunchpadResponse >( key );

			queryClient.setQueryData( key, {
				...previous,
				is_dismissed: true,
			} );

			return { previous };
		},
		onSuccess: () => {
			recordTracksEvent( 'calypso_launchpad_dismiss_guide', {
				checklist_slug: checklistSlug,
				context: launchpadContext,
			} );
		},
		onError: ( _, _2, context ) => {
			if ( context?.previous ) {
				queryClient.setQueryData( key, context?.previous );
			}
		},
	} );
};
