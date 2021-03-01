export const idSchema = {
	type: [ 'integer', 'null' ],
	minimum: 0,
};

export const currencyCodeSchema = {
	type: [ 'string', 'null' ],
};

export const capabilitiesSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			properties: {
				edit_pages: { type: 'boolean' },
				edit_posts: { type: 'boolean' },
				edit_others_posts: { type: 'boolean' },
				edit_others_pages: { type: 'boolean' },
				delete_posts: { type: 'boolean' },
				delete_others_posts: { type: 'boolean' },
				edit_theme_options: { type: 'boolean' },
				edit_users: { type: 'boolean' },
				list_users: { type: 'boolean' },
				manage_categories: { type: 'boolean' },
				manage_options: { type: 'boolean' },
				promote_users: { type: 'boolean' },
				publish_posts: { type: 'boolean' },
				upload_files: { type: 'boolean' },
				delete_users: { type: 'boolean' },
				remove_users: { type: 'boolean' },
				view_stats: { type: 'boolean' },
			},
		},
	},
};

export const flagsSchema = {
	type: 'array',
};

export const lasagnaSchema = {
	type: [ 'string', 'null' ],
};
