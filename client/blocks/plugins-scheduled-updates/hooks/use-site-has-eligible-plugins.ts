import { useContext } from 'react';
import { useCorePluginsQuery } from 'calypso/data/plugins/use-core-plugins-query';
import { PluginUpdateManagerContext } from '../context';

export function useSiteHasEligiblePlugins( siteSlug?: string ) {
	const { siteSlug: contextSiteSlug } = useContext( PluginUpdateManagerContext );
	const slug = siteSlug || contextSiteSlug;
	const { data: plugins = [], isFetched: isPluginsFetched } = useCorePluginsQuery(
		slug,
		true,
		true
	);
	const siteHasEligiblePlugins = isPluginsFetched && plugins.length > 0;
	return { siteHasEligiblePlugins, loading: ! isPluginsFetched };
}
