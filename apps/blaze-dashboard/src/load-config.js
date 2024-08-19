// Fixes a typo in Jetpack config response
if ( window.configData?.intial_state ) {
	window.configData.initial_state = window.configData.intial_state;
	delete window.configData.intial_state;
}

// Forces the blog_id to be a number (the component BlazePageViewTracker breaks on atomic if its gets a string).
if ( window.configData?.blog_id ) {
	window.configData.blog_id = +window.configData.blog_id;
}

const isWooStore = window.configData?.is_woo_store || false;
const needSetup = window.configData?.need_setup || false;

// Using the isWooStore fallback condition for compatibility: That flag only comes true if they are using the Blaze plugin
const isBlazePlugin = window.configData?.is_blaze_plugin || isWooStore;

// The JSON is filtered by `apps/blaze-dashboard/filter-json-config-loader.js`.
import productionConfig from '../../../config/production.json';

// Set is_running_in_jetpack_site to true if not specified (undefined or null).
productionConfig.features.is_running_in_jetpack_site =
	window.configData.features.is_running_in_jetpack_site ?? true;

// Set is is_running_in_woo_site to true if the dashboard is running on the Blaze Ads plugin
productionConfig.features.is_running_in_blaze_plugin = isBlazePlugin;

productionConfig.features[ 'jetpack/magic-link-signup' ] = true;

// Set is is_running_in_woo_site to true if the dashboard is running on a Woo site
productionConfig.features.is_running_in_woo_site = isWooStore;

productionConfig.features.blaze_setup_mode = !! needSetup;

// The option enables loading of the whole translation file, and could be optimized by setting it to `true`, which needs the translation chunks in place.
// @see https://github.com/Automattic/wp-calypso/blob/trunk/docs/translation-chunks.md
productionConfig.features[ 'use-translation-chunks' ] = false;

// Sets the advertising path prefix for this app
productionConfig.advertising_dashboard_path_prefix = isBlazePlugin ? '/wc-blaze' : '/advertising';

// Note: configData is hydrated in Jetpack: https://github.com/Automattic/jetpack/blob/60b0dac0dc5ad7edec2b86edb57b65a3a98ec42d/projects/packages/blaze/src/class-dashboard-config-data.php#L31
window.configData = {
	...window.configData,
	...productionConfig,
};
