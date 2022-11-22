// The JSON is filtered by `apps/stats/filter-json-config-loader.js`.
import productionConfig from '../../../config/production.json';

// Set is_running_in_jetpack_site to true if not specified (undefined or null).
productionConfig.features.is_running_in_jetpack_site =
	window.configData.features.is_running_in_jetpack_site ?? true;

// Note: configData is hydrated in https://github.com/Automattic/jetpack/blob/d4d0f987cbf63a864b03b542b7813aabe87e0ed3/projects/packages/stats-admin/src/class-dashboard.php#L214
window.configData.features = productionConfig.features;
