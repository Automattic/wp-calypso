export const usersSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'ID', 'email' ],
			properties: {
				ID: { type: 'number' },
				display_name: { type: 'string' },
				username: { type: 'string' },
				avatar_URL: { type: 'string' },
				site_count: { type: 'number' },
				visible_site_count: { type: 'number' },
				date: { type: 'number' },
				has_unseen_notes: { type: 'boolean' },
				newest_note_type: { type: 'string' },
				phone_account: { type: 'string' },
				email: { type: 'string' },
				email_verified: { type: 'boolean' },
				is_valid_google_apps_country: { type: 'boolean' },
				user_ip_country_code: { type: 'string' },
				logout_URL: { type: 'string' },
				primary_blog: { type: 'string' },
				primary_blog_url: { type: 'string' },
				meta: { type: 'object' },
				is_new_reader: { type: 'boolean' },
				social_signup_service: { type: 'string' },
			}
		}
	},
	additionalProperties: false
};
