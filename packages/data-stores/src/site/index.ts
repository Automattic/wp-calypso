import { createReduxStore, registerStore } from '@wordpress/data';
import { registerPlugins } from '../plugins';
import { controls } from '../wpcom-request-controls';
import { createActions, ActionCreators } from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import type { WpcomClientCredentials } from '../shared-types';
import type { ReduxStoreConfig, StoreDescriptor } from '@wordpress/data';

export * from './types';
export type { State, ActionCreators as SiteActions };
export { STORE_KEY };

let store:
	StoreDescriptor< ReduxStoreConfig< State, ActionCreators, typeof selectors > > | undefined;
export function register( clientCreds: WpcomClientCredentials ) {
	if ( ! store ) {
		registerPlugins();

		const options = {
			actions: createActions( clientCreds ),
			controls,
			reducer,
			resolvers,
			selectors,
			persist: [ 'bundledPluginSlug' ],
		};
		// Persistence hooks into registerStore.
		registerStore( STORE_KEY, options );
		store = createReduxStore( STORE_KEY, options );
	}
	return store;
}

/**
 * Queries
 */
export { default as useSite } from './queries/use-site';
export { default as useSiteFeatures } from './queries/use-site-features';
export { default as useSiteMediaStorage } from './queries/use-site-media-storage';
export { default as useSiteUser } from './queries/use-site-user-query';
