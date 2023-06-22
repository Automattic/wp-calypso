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
productionConfig.features[ 'promote-post/widget-i2' ] = true;

// Note: configData is hydrated in Jetpack: projects/packages/blaze/src/class-dashboard-config-data.php - method `get_data`
// TODO: link to Github when code in Jetpack is merged
window.configData.features = productionConfig.features;
window.configData.advertising_dashboard_path_prefix = '/advertising';
window.configData.dsp_stripe_pub_key = productionConfig.dsp_stripe_pub_key;
window.configData.dsp_widget_js_src = productionConfig.dsp_widget_js_src;
