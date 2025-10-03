import { SitePlugin } from '@automattic/api-core';
import { ActionOnExecuteResponse } from '../components/action-render-modal';
import type { PluginListRow } from '../types';

type PluginMutationAction = ( vars: {
	siteId: number;
	pluginId: string;
} ) => Promise< SitePlugin | void >;

export const buildBulkSitesPluginAction = ( action: PluginMutationAction ) => {
	return async ( items: PluginListRow[] ): Promise< ActionOnExecuteResponse > => {
		const sitePluginTuples = items
			.map( ( row ) => row.siteIds.map( ( siteId ): [ number, string ] => [ siteId, row.id ] ) )
			.flat( 1 );

		const tasks = sitePluginTuples.map( ( [ siteId, pluginId ] ) =>
			action( { siteId, pluginId } )
		);
		const results = await Promise.allSettled( tasks );
		const failures = results.filter( ( r ) => r.status === 'rejected' ) as PromiseRejectedResult[];
		const successCount = results.length - failures.length;
		const errorCount = failures.length;
		return { successCount, errorCount };
	};
};
