import { reinstallMarketplacePlugins } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const reinstallMarketplacePluginsQuery = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => reinstallMarketplacePlugins( siteId ),
	} );
