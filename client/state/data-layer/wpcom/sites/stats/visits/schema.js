export default {
	id: 'sites-stats-visits-response',
	title: 'Stats Visits Response',
	type: 'object',
	$schema: 'http://json-schema.org/draft-04/schema#',
	properties: {
		data: {
			type: 'array',
			items: {
				type: 'array',
				items: {
					type: [ 'integer', 'string', 'array' ],
				},
			},
		},
		fields: {
			type: 'array',
		},
		unit: {
			type: 'string',
		},
	},
};
