import {
	sitePluginActivateMutation,
	sitePluginAutoupdateDisableMutation,
	sitePluginAutoupdateEnableMutation,
	sitePluginDeactivateMutation,
	sitePluginRemoveMutation,
	sitePluginUpdateMutation,
} from '@automattic/api-queries';
import type { SitePluginAction } from '../types';

export type RunPerSiteResult = {
	successCount: number;
	errorCount: number;
	messages: string[];
};

export const runPerSitePlugin = async (
	siteIds: number[],
	slug: string,
	action: SitePluginAction
): Promise< RunPerSiteResult > => {
	const tasks = siteIds.map( async ( siteId ) => {
		let opts:
			| ReturnType< typeof sitePluginActivateMutation >
			| ReturnType< typeof sitePluginDeactivateMutation >
			| ReturnType< typeof sitePluginUpdateMutation >
			| ReturnType< typeof sitePluginAutoupdateEnableMutation >
			| ReturnType< typeof sitePluginAutoupdateDisableMutation >
			| ReturnType< typeof sitePluginRemoveMutation >;
		switch ( action ) {
			case 'activate':
				opts = sitePluginActivateMutation( siteId );
				break;
			case 'deactivate':
				opts = sitePluginDeactivateMutation( siteId );
				break;
			case 'update':
				opts = sitePluginUpdateMutation( siteId );
				break;
			case 'enable-autoupdate':
				opts = sitePluginAutoupdateEnableMutation( siteId );
				break;
			case 'disable-autoupdate':
				opts = sitePluginAutoupdateDisableMutation( siteId );
				break;
			case 'remove':
				opts = sitePluginRemoveMutation( siteId );
				break;
		}
		const result = await opts.mutationFn?.( slug as any );
		await opts.onSuccess?.( result as any, slug as any, undefined );
	} );
	const results = await Promise.allSettled( tasks );
	const failures = results.filter( ( r ) => r.status === 'rejected' ) as PromiseRejectedResult[];
	const successCount = results.length - failures.length;
	const errorCount = failures.length;
	const messages = failures
		.map( ( f ) => {
			const reason: any = f.reason;
			return ( reason && ( reason.message || reason?.data?.message ) ) || '';
		} )
		.filter( Boolean );
	return { successCount, errorCount, messages };
};
