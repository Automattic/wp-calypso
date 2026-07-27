import { useInterval } from 'calypso/lib/interval';
import { useDispatch } from 'calypso/state';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';

const POLL_INTERVAL_MS = 3000;

// A checkout-initiated marketplace plugin installs in the background after the Atomic transfer, so
// while enabled keep the site's plugin list fresh. The redirect watches the refreshed `installedPlugin`
// / `pluginActive` state and fires once the plugin reports active.
export function useMarketplacePluginPolling( {
	siteId,
	enabled,
}: {
	siteId: number;
	enabled: boolean;
} ): void {
	const dispatch = useDispatch();
	useInterval( () => dispatch( fetchSitePlugins( siteId ) ), enabled ? POLL_INTERVAL_MS : null );
}
