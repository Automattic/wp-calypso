export const authorizeQueryDataSchema = {
	type: 'object',
	required: [
		'_wp_nonce',
		'blogname',
		'client_id',
		'home_url',
		'redirect_uri',
		'scope',
		'secret',
		'site',
		'site_url',
		'state',
	],
	properties: {
		_ui: { type: 'string' },
		_ut: { type: 'string' },
		_wp_nonce: { type: 'string' },
		already_authorized: { type: 'string' },
		auth_approved: { type: 'string' },
		blogname: { type: 'string' },
		client_id: { pattern: '^\\d+$', type: 'string' },
		close_window_after_login: { type: 'string' }, // '1' if true
		close_window_after_auth: { type: 'string' }, // '1' if true
		from: { type: 'string' },
		home_url: { type: 'string' },
		is_popup: { type: 'string' }, // '1' if true
		jp_version: { type: 'string' },
		partner_id: { pattern: '^\\d+$', type: 'string' },
		redirect_after_auth: { type: 'string' },
		redirect_uri: { type: 'string' },
		scope: { type: 'string' },
		secret: { type: 'string' },
		site: { type: 'string' },
		site_icon: { type: 'string' },
		site_lang: { type: 'string' },
		site_url: { type: 'string' },
		state: { type: 'string' },
		user_email: { type: 'string' },
		woodna_service_name: { type: 'string' },
		woodna_help_url: { type: 'string' },
		skip_user: { type: 'string' }, // deprecated, to be removed soon
		allow_site_connection: { type: 'string' }, // '1' if true
		installed_ext_success: { type: 'string' }, // '1' if true
		plugin_name: { type: 'string' },
		color_scheme: { type: 'string' },
	},
};
