export const localeSchema = {
	type: 'object',
	properties: {
		localeSlug: { type: [ 'string', 'null' ] },
		localeVariant: { type: [ 'string', 'null' ] },
	},
};
