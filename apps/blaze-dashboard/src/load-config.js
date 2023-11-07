// The JSON is filtered by `apps/blaze-dashboard/filter-json-config-loader.js`.
import productionConfig from '../../../config/production.json';

// Set is_running_in_jetpack_site to true if not specified (undefined or null).
productionConfig.features.is_running_in_jetpack_site =
	window.configData.features.is_running_in_jetpack_site ?? true;

// The option enables loading of the whole translation file, and could be optimized by setting it to `true`, which needs the translation chunks in place.
// @see https://github.com/Automattic/wp-calypso/blob/trunk/docs/translation-chunks.md
productionConfig.features[ 'use-translation-chunks' ] = false;

// Sets the advertising path prefix for this app
productionConfig.advertising_dashboard_path_prefix = '/advertising';

// Note: configData is hydrated in Jetpack: https://github.com/Automattic/jetpack/blob/60b0dac0dc5ad7edec2b86edb57b65a3a98ec42d/projects/packages/blaze/src/class-dashboard-config-data.php#L31
window.configData = {
	...window.configData,
	...productionConfig,
};

// Fixes a typo in Jetpack config response
if ( window.configData.intial_state ) {
	window.configData.initial_state = window.configData.intial_state;
	delete window.configData.intial_state;
}
