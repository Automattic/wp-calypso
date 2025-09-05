import { runPerSitePlugin } from './run-per-site-plugin';
import type { PluginListRow, SitePluginAction } from '../types';

export type OnExecuteFn = (
	items: PluginListRow[]
) => Promise< { successCount: number; errorCount: number } >;

/**
 * Builds a standard onExecute handler for plugin actions that operate per-site per-plugin.
 * The handler will iterate over provided items and run the given action across their siteIds.
 */
export function buildOnExecuteForAction( action: SitePluginAction ): OnExecuteFn {
	return async ( items: PluginListRow[] ) => {
		let successCount = 0;
		let errorCount = 0;
		for ( const it of items ) {
			const res = await runPerSitePlugin( it.siteIds ?? [], it.id, action );
			successCount += res.successCount;
			errorCount += res.errorCount;
		}
		return { successCount, errorCount };
	};
}
