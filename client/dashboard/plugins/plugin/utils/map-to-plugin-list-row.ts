import { SiteWithPluginActivationStatus, usePlugin } from '../use-plugin';
import type { PluginListRow } from '../../manage/types';

export const mapToPluginListRow = (
	plugin: ReturnType< typeof usePlugin >[ 'plugin' ],
	items: SiteWithPluginActivationStatus[]
): Partial< PluginListRow > => {
	return {
		id: plugin?.id,
		slug: plugin?.slug,
		name: plugin?.name,
		siteIds: items.map( ( item ) => item.ID ),
		sitesCount: items.length,
	};
};
