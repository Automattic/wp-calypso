/** @format */
export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			items: {
				job_manager_per_page: { type: 'integer' },
				job_manager_hide_filled_positions: { type: 'boolean' },
				job_manager_hide_expired: { type: 'boolean' },
				job_manager_hide_expired_content: { type: 'boolean' },
				job_manager_enable_categories: { type: 'boolean' },
				job_manager_enable_default_category_multiselect: { type: 'boolean' },
				job_manager_category_filter_type: { type: 'string' },
				job_manager_date_format: { type: 'string' },
				job_manager_enable_types: { type: 'boolean' },
				job_manager_multi_job_type: { type: 'boolean' },
				job_manager_google_maps_api_key: { type: 'string' },
				job_manager_user_requires_account: { type: 'boolean' },
				job_manager_enable_registration: { type: 'boolean' },
				job_manager_generate_username_from_email: { type: 'boolean' },
				job_manager_registration_role: { type: 'string' },
				job_manager_submission_requires_approval: { type: 'boolean' },
				job_manager_user_can_edit_pending_submissions: { type: 'boolean' },
				job_manager_submission_duration: { type: 'integer' },
				job_manager_allowed_application_method: { type: 'string' },
				job_manager_submit_job_form_page_id: { type: 'integer' },
				job_manager_job_dashboard_page_id: { type: 'integer' },
				job_manager_jobs_page_id: { type: 'integer' },
			},
		},
	},
};
