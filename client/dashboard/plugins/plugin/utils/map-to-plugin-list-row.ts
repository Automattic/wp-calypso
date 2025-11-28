import { SiteWithPluginData, usePlugin } from '../use-plugin';
import type { PluginListRow } from '../../manage/types';

export const mapToPluginListRow = (
	plugin: ReturnType< typeof usePlugin >[ 'plugin' ],
	items: SiteWithPluginData[]
): Partial< PluginListRow > => {
	return {
		id: plugin?.id,
		slug: plugin?.slug,
		name: plugin?.name,
		sitesWithPluginActive: items
			.filter( ( item ) => item.isPluginActive )
			.map( ( item ) => item.ID ),
		sitesWithPluginInactive: items
			.filter( ( item ) => ! item.isPluginActive )
			.map( ( item ) => item.ID ),
		sitesWithPluginUpdate: items
			.filter( ( item ) => item.hasPluginUpdate )
			.map( ( item ) => item.ID ),
		sitesWithPluginAutoupdated: items
			.filter( ( item ) => item.isPluginAutoupdated )
			.map( ( item ) => item.ID ),
		sitesWithPluginNotAutoupdated: items
			.filter( ( item ) => ! item.isPluginAutoupdated )
			.map( ( item ) => item.ID ),
		siteIds: items.map( ( item ) => item.ID ),
		sitesCount: items.length,
	};
};
