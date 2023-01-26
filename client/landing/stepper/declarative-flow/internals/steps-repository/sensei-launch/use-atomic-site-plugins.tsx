import { useDispatch } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { useDispatch as useRootDispatch, useSelector } from 'react-redux';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	fetchSitePlugins,
	installPlugin as installPluginAction,
} from 'calypso/state/plugins/installed/actions';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import { ManagedPlugin, Plugin } from '../sensei-purpose/purposes';

interface InstalledPlugin {
	id: string;
	slug: string;
	active: boolean;
}

export function useAtomicSitePlugins() {
	const dispatch = useRootDispatch();
	const { initiateSoftwareInstall } = useDispatch( SITE_STORE );
	const [ pluginQueue, setPluginQueue ] = useState< Array< Plugin > >( [] );
	const siteId = useSite()?.ID as number;

	const plugins: InstalledPlugin[] = useSelector( ( state ) => {
		return siteId ? getPlugins( state, [ siteId ] ) : [];
	} );

	const pollPlugins = useCallback(
		() => dispatch( fetchSitePlugins( siteId ) ),
		[ dispatch, siteId ]
	);

	const isPluginInstalled = useCallback(
		( slug: string ) => plugins.find( ( plugin ) => plugin.slug === slug )?.active,
		[ plugins ]
	);

	const installPluginOrSoftwareSet = useCallback(
		( plugin: Plugin ) => {
			const { softwareSet } = plugin as ManagedPlugin;
			if ( softwareSet ) {
				initiateSoftwareInstall( siteId, softwareSet );
			} else {
				const { slug } = plugin as Exclude< Plugin, ManagedPlugin >;
				if ( slug && ! isPluginInstalled( slug ) ) {
					dispatch( installPluginAction( siteId, plugin ) );
				}
			}
		},
		[ initiateSoftwareInstall, siteId, isPluginInstalled, dispatch ]
	);

	useEffect( () => {
		if ( pluginQueue.length && plugins?.length ) {
			pluginQueue.forEach( installPluginOrSoftwareSet );
			setPluginQueue( [] );
		}
	}, [ plugins?.length, pluginQueue, siteId, installPluginOrSoftwareSet ] );

	const queuePlugin = useCallback(
		( plugin: Plugin ) => setPluginQueue( ( queue ) => [ ...queue, plugin ] ),
		[]
	);

	return { pollPlugins, isPluginInstalled, queuePlugin };
}
