// The JSON is filtered by `apps/blaze-dashboard/filter-json-config-loader.js`.
import productionConfig from '../../../config/production.json';

// Set is_running_in_jetpack_site to true if not specified (undefined or null).
productionConfig.features.is_running_in_jetpack_site =
	window.configData.features.is_running_in_jetpack_site ?? true;

// The option enables loading of the whole translation file, and could be optimized by setting it to `true`, which needs the translation chunks in place.
// @see https://github.com/Automattic/wp-calypso/blob/trunk/docs/translation-chunks.md
productionConfig.features[ 'use-translation-chunks' ] = false;

// Override the redesign feature
productionConfig.features[ 'promote-post/redesign-i2' ] = true;

// Note: configData is hydrated in https://github.com/Automattic/jetpack/blob/d4d0f987cbf63a864b03b542b7813aabe87e0ed3/projects/packages/stats-admin/src/class-dashboard.php#L214
window.configData.features = productionConfig.features;
window.configData.advertising_dashboard_path_prefix = '/jetpack-blaze';
window.configData.dsp_stripe_pub_key = productionConfig.dsp_stripe_pub_key;
window.configData.dsp_widget_js_src = productionConfig.dsp_widget_js_src;
