import { registerStore } from '@wordpress/data';
import { registerPlugins } from '../plugins';
import { controls } from '../wpcom-request-controls';
import { createActions, ActionCreators } from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import type { WpcomClientCredentials } from '../shared-types';

export * from './types';
export type { State, ActionCreators as SiteActions };
export { STORE_KEY };

let isRegistered = false;
export function register( clientCreds: WpcomClientCredentials ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		registerPlugins();

		isRegistered = true;
		registerStore( STORE_KEY, {
			actions: createActions( clientCreds ),
			controls,
			reducer,
			resolvers,
			selectors,
			persist: [ 'bundledPluginSlug' ],
		} );
	}
	return STORE_KEY;
}

/**
 * Queries
 */
export { default as useSite } from './queries/use-site';
export { default as useSiteFeatures } from './queries/use-site-features';
export { default as useSiteMediaStorage } from './queries/use-site-media-storage';
export { default as useSiteUser } from './queries/use-site-user-query';
