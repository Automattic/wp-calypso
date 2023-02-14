import apiFetch from '@wordpress/api-fetch';
import { useQuery } from 'react-query';

const useSiteIntent = () => {
	const queryInfo = useQuery(
		'site-intent', // add Site ID ?
		() =>
			apiFetch( { path: '/wpcom/v2/site-intent' } )
				.then( ( result ) => result.site_intent )
				.catch( () => '' ),
		{
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			//enabled: !! siteId,
		}
	);
	return queryInfo.data || '';
};
export default useSiteIntent;

/*
	different endpoint / request mechanism used outside of editing-toolkit:

	await wpcomRequest( {
		path: `/sites/${ encodeURIComponent( siteId as string ) }/site-intent`,
		apiNamespace: 'wpcom/v2',
	} ),
*/
