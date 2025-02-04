/**
 * The config package is to provide a compatible way to access config data exactly like `@automattic/calypso-config`.
 *
 * - Adds support for custom config data sources for Odyssey Apps.
 * - Adds feature flag gating for Odyssey Apps.
 * - The package must first be initialized before use via an invocation of `initConfig`.
 */

import { ConfigApi } from './create-odyssey-config';

const configApi = new ConfigApi();

export function initConfig( configKey = 'configData' ) {
	configApi.init( configKey );
}

export default configApi;
export const isEnabled = configApi.isEnabled.bind( configApi );
export const enabledFeatures = configApi.enabledFeatures.bind( configApi );
export const enable = configApi.enable.bind( configApi );
export const disable = configApi.disable.bind( configApi );
