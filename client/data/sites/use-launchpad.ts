import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const fetchLaunchpad = ( siteSlug: string | null ) => {
	const slug = encodeURIComponent( siteSlug as string );

	return (
		wpcom.req
			.get( {
				path: `/sites/${ slug }/launchpad`,
				apiNamespace: 'wpcom/v2',
			} )
			// There are unidentified situations where the fetch launchpad
			// get request fail. We introduce error handling that returns
			// placeholder data as a temporary stopgap to prevent noisy sentry
			// logs from being generated.
			.catch( () => {
				return Promise.resolve( {
					checklist_statuses: [],
					launchpad_screen: undefined,
					site_intent: '',
				} );
			} )
	);
};

type LaunchpadUpdateSettings = {
	launchpad_checklist_tasks_statuses?: Record< string, boolean >;
};

export const updateLaunchpadSettings = (
	siteSlug: string | null,
	settings: LaunchpadUpdateSettings = {}
) => {
	const slug = encodeURIComponent( siteSlug as string );

	return wpcom.req
		.post(
			{
				path: `/sites/${ slug }/launchpad`,
				apiNamespace: 'wpcom/v2',
			},
			settings
		)
		.catch();
};

export const useLaunchpad = ( siteSlug: string | null, cache = true ) => {
	const key = [ 'launchpad', siteSlug ];
	return useQuery( key, () => siteSlug && fetchLaunchpad( siteSlug ), {
		meta: {
			persist: cache,
		},
		enabled: true,
		placeholderData: {
			checklist_statuses: [],
			launchpad_screen: undefined,
			site_intent: '',
		},
	} );
};
