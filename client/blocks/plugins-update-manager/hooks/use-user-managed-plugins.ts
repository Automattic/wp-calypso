import { useContext, useEffect } from 'react';
import { CorePluginsResponse } from 'calypso/data/plugins/use-core-plugins-query';
import { PluginUpdateManagerContext } from '../context';

export function useSetHasUserManagedPlugins( data: CorePluginsResponse, isFetched: boolean ) {
	const { setHasUserManagedPlugins } = useContext( PluginUpdateManagerContext );
	useEffect( () => {
		if ( isFetched && ! data.filter( ( plugin ) => ! plugin.is_managed ).length ) {
			setHasUserManagedPlugins( false );
			return;
		}
	}, [ data, isFetched ] );
}

export function useHasUserManagedPlugins() {
	const { hasUserManagedPlugins } = useContext( PluginUpdateManagerContext );
	return hasUserManagedPlugins;
}
