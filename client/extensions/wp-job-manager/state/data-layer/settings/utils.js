export const fromApi = data => ( {
	listings: {
		perPage: data.job_manager_per_page,
		hideFilledPositions: data.job_manager_hide_filled_positions,
		hideExpired: data.job_manager_hide_expired,
		hideExpiredContent: data.job_manager_hide_expired_content,
	},
	categories: {
		enableCategories: data.job_manager_enable_categories,
		enableDefaultCategory: data.job_manager_enable_default_category_multiselect,
		categoryFilterType: data.job_manager_category_filter_type,
	},
	types: {
		enableTypes: data.job_manager_enable_types,
		multiJobType: data.job_manager_multi_job_type,
	},
	format: {
		dateFormat: data.job_manager_date_format,
	},
	apiKey: {
		googleMapsApiKey: data.job_manager_google_maps_api_key,
	},
} );

export const toApi = data => ( {
	job_manager_per_page: data.perPage,
	job_manager_hide_filled_positions: data.hideFilledPositions,
	job_manager_hide_expired: data.hideExpired,
	job_manager_hide_expired_content: data.hideExpiredContent,
	job_manager_enable_categories: data.enableCategories,
	job_manager_enable_default_category_multiselect: data.enableDefaultCategory,
	job_manager_category_filter_type: data.categoryFilterType,
	job_manager_enable_types: data.enableTypes,
	job_manager_multi_job_type: data.multiJobType,
	job_manager_date_format: data.dateFormat,
	job_manager_google_maps_api_key: data.googleMapsApiKey,
} );
