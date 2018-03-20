/** @format */

/**
 * Internal dependencies
 */
import { withItemsSchema } from 'lib/query-manager/schema';

const themesSchema = {
	title: 'Theme',
	type: 'object',
	patternProperties: {
		'^\\w+$': {
			additionalProperties: false,
			required: [ 'id', 'name', 'author', 'screenshot' ],
			type: 'object',
			properties: {
				author: { type: 'string' },
				author_uri: { type: 'string' },
				demo_uri: { type: 'string' },
				id: { type: 'string' },
				name: { type: 'string' },
				price: { type: 'string' },
				screenshot: { type: 'string' },
				stylesheet: { type: 'string' },
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
