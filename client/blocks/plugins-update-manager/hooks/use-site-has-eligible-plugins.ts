import { useContext } from 'react';
import { PluginUpdateManagerContext } from '../context';

export function useSiteHasEligiblePlugins() {
	const { siteHasEligiblePlugins, siteHasEligiblePluginsLoading } = useContext(
		PluginUpdateManagerContext
	);
	return { siteHasEligiblePlugins, loading: siteHasEligiblePluginsLoading };
}
