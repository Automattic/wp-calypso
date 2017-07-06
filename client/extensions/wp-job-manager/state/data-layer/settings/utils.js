export const fromApi = data => ( {
	account: {
		enableRegistration: data.job_manager_enable_registration,
		generateUsername: data.job_manager_generate_username_from_email,
		isRequired: data.job_manager_user_requires_account,
		role: data.job_manager_registration_role,
	},
	apiKey: {
		googleMapsApiKey: data.job_manager_google_maps_api_key,
	},
	approval: {
		canEdit: data.job_manager_user_can_edit_pending_submissions,
		isRequired: data.job_manager_submission_requires_approval,
	},
	categories: {
		enableCategories: data.job_manager_enable_categories,
		enableDefaultCategory: data.job_manager_enable_default_category_multiselect,
		categoryFilterType: data.job_manager_category_filter_type,
	},
	duration: {
		submissionDuration: data.job_manager_submission_duration,
	},
	format: {
		dateFormat: data.job_manager_date_format,
	},
	listings: {
		perPage: data.job_manager_per_page,
		hideFilledPositions: data.job_manager_hide_filled_positions,
		hideExpired: data.job_manager_hide_expired,
		hideExpiredContent: data.job_manager_hide_expired_content,
	},
	method: {
		applicationMethod: data.job_manager_allowed_application_method,
	},
	types: {
		enableTypes: data.job_manager_enable_types,
		multiJobType: data.job_manager_multi_job_type,
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
