export const cacheSchema = {
	cached: { type: 'integer' },
	cached_list: { type: 'object' },
	expired: { type: 'integer' },
	expired_list: { type: 'object' },
	fsize: { type: 'integer' },
};

export const statsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
			items: {
				supercache: {
					type: 'object',
					items: cacheSchema,
				},
				wpcache: {
					type: 'object',
					items: cacheSchema,
				},
			},
		},
	},
};
