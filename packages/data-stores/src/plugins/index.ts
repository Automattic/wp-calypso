import { plugins, use as registerDataPlugin } from '@wordpress/data';
import persistOptions from './one-week-persistence-config';
import type { DataPlugin } from '@wordpress/data';

let isRegistered = false;
// Data stores can be bundled independently while sharing the same wp.data registry.
const pluginRegistry = registerDataPlugin as typeof registerDataPlugin & {
	__automatticDataStoresPersistencePluginRegistered?: boolean;
};

const persistencePlugin: DataPlugin = ( registry, options ) => {
	// Destructured so webpack sees `plugins` used whole: with `plugins.persistence` it can skip the
	// plugins barrel in some builds and not others, changing chunk hashes between identical builds.
	// Read here rather than at module load, as tests mock @wordpress/data without `plugins`.
	const { persistence } = plugins;
	return persistence(
		{
			...registry,
			registerStore( storeName, storeOptions ) {
				const storeOptionsWithoutPersistence = { ...storeOptions } as typeof storeOptions & {
					persist?: boolean | string[];
				};

				// A previously loaded bundle may already have installed persistence.
				// Only the outer plugin should hydrate and subscribe to this store.
				delete storeOptionsWithoutPersistence.persist;
				return registry.registerStore( storeName, storeOptionsWithoutPersistence );
			},
		},
		options as Parameters< typeof persistence >[ 1 ]
	);
};

export const registerPlugins = () => {
	if ( isRegistered || pluginRegistry.__automatticDataStoresPersistencePluginRegistered ) {
		return;
	}

	/**
	 * Register plugins for data-stores
	 */
	registerDataPlugin( persistencePlugin, persistOptions );
	isRegistered = true;
	pluginRegistry.__automatticDataStoresPersistencePluginRegistered = true;
};
