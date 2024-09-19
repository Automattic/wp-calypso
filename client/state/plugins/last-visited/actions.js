import { PLUGINS_SET_LAST_VISITED } from 'calypso/state/action-types';
import 'calypso/state/plugins/init';

export function setLastVisitedPlugin( pluginSlug, pluginListName ) {
	return {
		type: PLUGINS_SET_LAST_VISITED,
		payload: { slug: pluginSlug, listName: pluginListName },
	};
}
