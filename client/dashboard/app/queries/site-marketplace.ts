import { mutationOptions } from '@tanstack/react-query';
import { reinstallMarketplacePlugins } from '../../data/site-marketplace';

export const reinstallMarketplacePluginsQuery = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => reinstallMarketplacePlugins( siteId ),
	} );
