import QueryAllJetpackSitesPlugins from '../query-all-jetpack-sites-plugins';
import QueryJetpackPlugins from '../query-jetpack-plugins';

export default function QueryPlugins( { siteId }: { siteId?: number } ) {
	return siteId ? <QueryJetpackPlugins siteIds={ [ siteId ] } /> : <QueryAllJetpackSitesPlugins />;
}
