/**
 * Internal dependencies
 */
import { withItemsSchema } from 'calypso/lib/query-manager/schema';

const themesSchema = {
	title: 'Theme',
	additionalProperties: false,
	type: 'object',
	patternProperties: {
		'^[\\w-]+$': {
			additionalProperties: true,
			required: [ 'id', 'name', 'author', 'screenshot' ],
			type: 'object',
			properties: {
				active: { type: 'boolean' },
				author: { type: 'string' },
				author_uri: { type: 'string' },
				autoupdate: { type: 'boolean' },
				autoupdate_translation: { type: 'boolean' },
				demo_uri: { type: 'string' },
				description: { type: 'string' },
				id: { type: 'string' },
				name: { type: 'string' },
				price: { type: 'string' },
				screenshot: { type: 'string' },
				stylesheet: { type: 'string' },
				tags: {
					type: 'array',
					items: { type: 'string' },
				},
				taxonomies: { type: 'object' },
				theme_uri: { type: 'string' },
				update: { type: [ 'null', 'object' ] },
				version: { type: 'string' },
			},
		},
	},
};

const themeQueryManagerSchema = withItemsSchema( themesSchema );

export const queriesSchema = {
	type: 'object',
	properties: {
		_timestamp: { type: 'number' },
	},
	patternProperties: {
		// Site ID
		'^(wpcom|wporg|\\d+)$': themeQueryManagerSchema,
	},
	additionalProperties: false,
};

export const activeThemesSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			description: 'Theme ID',
			type: 'string',
		},
	},
};

export const themeRequestErrorsSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^(wpcom|wporg|\\d+)$': {
			type: 'object',
			patternProperties: {
				// Theme ID
				'^\\w+$': {
					type: 'object',
					properties: {
						path: { type: 'string' },
						method: { type: 'string' },
						name: { type: 'string' },
						statusCode: { type: 'number' },
						status: { type: 'number' },
						message: { type: 'string' },
						error: { type: 'string' },
					},
				},
			},
		},
	},
};

export const themeFiltersSchema = {
	type: 'object',
	patternProperties: {
		// Taxonomy ID
		'^[\\w-]+$': {
			title: 'Taxonomy',
			type: 'object',
			patternProperties: {
				// Term (i.e. filter) ID
				'^\\w+$': {
					title: 'Term',
					type: 'object',
					properties: {
						name: { type: 'string' },
						description: { type: 'string' },
					},
				},
			},
			uniqueItems: true,
		},
	},
	additionalProperties: false,
};
