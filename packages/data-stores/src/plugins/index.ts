import { plugins, use as registerDataPlugin } from '@wordpress/data';
import persistOptions from './one-week-persistence-config';

let isRegistered = false;
// Data stores can be bundled independently while sharing the same wp.data registry.
const pluginRegistry = registerDataPlugin as typeof registerDataPlugin & {
	__automatticDataStoresPersistencePluginRegistered?: boolean;
};

export const registerPlugins = () => {
	if ( isRegistered || pluginRegistry.__automatticDataStoresPersistencePluginRegistered ) {
		return;
	}

	/**
	 * Register plugins for data-stores
	 */
	registerDataPlugin( plugins.persistence, persistOptions );
	isRegistered = true;
	pluginRegistry.__automatticDataStoresPersistencePluginRegistered = true;
};
