/**
 * The config package is to provide a comaptible way to access config data exactly like `@automattic/calypso-config`.
 *
 * - The package supports custom config data source, which is useful for Odyssey Apps.
 * - Restored feature flag gating for Odyssey Apps.
 * - The package must be initialized before using with `initConfig`.
 */

import { ConfigApi } from './create-odyssey-config';

const configApi = new ConfigApi();

export function initConfig( configKey = 'configData' ) {
	configApi.init( configKey );
}

export default configApi;
export const isEnabled = configApi.isEnabled;
export const enabledFeatures = configApi.enabledFeatures;
export const enable = configApi.enable;
export const disable = configApi.disable;
