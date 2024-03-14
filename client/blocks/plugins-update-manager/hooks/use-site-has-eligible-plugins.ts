import { useContext, useEffect } from 'react';
import { CorePluginsResponse } from 'calypso/data/plugins/use-core-plugins-query';
import { PluginUpdateManagerContext } from '../context';

export function useSetSiteHasEligiblePlugins( data: CorePluginsResponse, isFetched: boolean ) {
	const { setSiteHasEligiblePlugins } = useContext( PluginUpdateManagerContext );
	useEffect( () => {
		if ( isFetched && ! data.filter( ( plugin ) => ! plugin.is_managed ).length ) {
			setSiteHasEligiblePlugins( false );
			return;
		}
	}, [ data, isFetched ] );
}

export function useSiteHasEligiblePlugins() {
	const { siteHasEligiblePlugins } = useContext( PluginUpdateManagerContext );
	return siteHasEligiblePlugins;
}
