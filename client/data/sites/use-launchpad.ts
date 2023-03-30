import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const fetchLaunchpad = ( siteSlug: string | null ) => {
	const slug = encodeURIComponent( siteSlug as string );

	return wpcom.req.get( {
		path: `/sites/${ slug }/launchpad`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const useLaunchpad = ( siteSlug: string | null ) => {
	const key = [ 'launchpad', siteSlug ];
	return useQuery( key, () => fetchLaunchpad( siteSlug ), {
		refetchOnMount: true,
		staleTime: 0,
		retry: 3,
		initialData: {
			checklist_statuses: [],
			launchpad_screen: undefined,
			site_intent: '',
		},
	} );
};
