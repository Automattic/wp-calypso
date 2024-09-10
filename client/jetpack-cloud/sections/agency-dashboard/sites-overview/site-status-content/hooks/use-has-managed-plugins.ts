import { useMemo } from 'react';
import {
	AUTOMOMANAGED_PLUGINS,
	ECOMMERCE_BUNDLED_PLUGINS,
	PREINSTALLED_PLUGINS,
	PREINSTALLED_PREMIUM_PLUGINS,
} from 'calypso/my-sites/plugins/constants';
import { Site } from '../../types';

const useHasManagedPlugins = ( site: Site ): boolean => {
	return useMemo( () => {
		if ( ! site?.is_atomic || ! site?.awaiting_plugin_updates ) {
			return false;
		}

		return site.awaiting_plugin_updates.some(
			( plugin ) =>
				PREINSTALLED_PLUGINS.includes( plugin ) ||
				AUTOMOMANAGED_PLUGINS.includes( plugin ) ||
				ECOMMERCE_BUNDLED_PLUGINS.includes( plugin ) ||
				Object.keys( PREINSTALLED_PREMIUM_PLUGINS ).includes( plugin )
		);
	}, [ site?.is_atomic, site?.awaiting_plugin_updates ] );
};

export default useHasManagedPlugins;
