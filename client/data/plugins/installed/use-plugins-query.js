import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { receiveSitePlugins, updatePlugin } from 'calypso/state/plugins/installed/actions';

export function getCacheKey( siteIds ) {
	if ( siteIds.length === 1 ) {
		return [ 'plugins', siteIds[ 0 ] ];
	}
	// The `dev` and `view` query params are not included in the cache key because we want all
	// the hooks to have the same idea of what the current view is, regardless of dev flags.
	return [ 'all-plugins' ];
}

const usePluginsQuery = ( siteIds, queryOptions = {} ) => {
	let fetch = () => wpcom.req.get( '/me/sites/plugins' );
	const siteId = siteIds[ 0 ];

	if ( siteIds.length === 1 ) {
		fetch = () => wpcom.site( siteId ).pluginsList();
	}

	const dispatch = useDispatch();
	return useQuery( getCacheKey( siteIds ), fetch, {
		...queryOptions,
		onSuccess: ( data ) => {
			if ( data.sites ) {
				for ( const [ siteIdKey, plugins ] of Object.entries( data.sites ) ) {
					dispatch( receiveSitePlugins( siteIdKey, plugins ) );
				}
			} else {
				dispatch( receiveSitePlugins( siteId, data.plugins ) );
				data.plugins.map( ( plugin ) => {
					if ( plugin.update && plugin.autoupdate ) {
						updatePlugin( siteId, plugin )( dispatch );
					}
				} );
			}
		},
	} );
};

export default usePluginsQuery;
