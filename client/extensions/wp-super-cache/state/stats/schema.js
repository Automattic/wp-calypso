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
					items: {
						cached: { type: 'integer' },
						cached_list: { type: 'object' },
						expired: { type: 'integer' },
						expired_list: { type: 'object' },
						fsize: { type: 'integer' },
					}
				},
				wpcache: {
					type: 'object',
					items: {
						cached: { type: 'integer' },
						cached_list: { type: 'object' },
						expired: { type: 'integer' },
						expired_list: { type: 'object' },
						fsize: { type: 'integer' },
					}
				}
			}
		}
	}
};
