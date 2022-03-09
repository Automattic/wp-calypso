import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export function getCacheKey( siteIds ) {
	if ( siteIds.length === 1 ) {
		return [ 'plugins', siteIds[ 0 ] ];
	}
	// The `dev` and `view` query params are not included in the cache key because we want all
	// the hooks to have the same idea of what the current view is, regardless of dev flags.
	return [ 'plugins' ];
}

const usePluginsQuery = ( siteIds ) => {
	let path = '/me/sites/plugins';
	if ( siteIds.length === 1 ) {
		path = `/sites/${ siteIds[ 0 ] }/plugins`;
	}
	return useQuery( getCacheKey( siteIds ), () =>
		wpcom.req.get( {
			path,
			apiNamespace: 'rest/v1.1',
		} )
	);
};

export default usePluginsQuery;
