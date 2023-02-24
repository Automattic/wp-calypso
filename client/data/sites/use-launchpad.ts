import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const fetchLaunchpad = ( siteSlug: string ) => {
	const slug = encodeURIComponent( siteSlug as string );
	return wpcom.req.get( {
		path: `/sites/${ slug }/launchpad`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const useLaunchpad = ( siteSlug: string, cache = true ) => {
	const key = [ 'launchpad', siteSlug ];
	return useQuery( key, () => fetchLaunchpad( siteSlug ), {
		meta: {
			persist: cache,
		},
		enabled: true,
	} );
};
