import { useContext } from 'react';
import { useCorePluginsQuery } from 'calypso/data/plugins/use-core-plugins-query';
import { PluginUpdateManagerContext } from '../context';

export function useSiteHasEligiblePlugins() {
	const { siteSlug } = useContext( PluginUpdateManagerContext );
	const { data: plugins = [], isFetched: isPluginsFetched } = useCorePluginsQuery(
		siteSlug,
		true,
		true
	);
	const siteHasEligiblePlugins = isPluginsFetched && plugins.length > 0;
	return { siteHasEligiblePlugins, loading: ! isPluginsFetched };
}
