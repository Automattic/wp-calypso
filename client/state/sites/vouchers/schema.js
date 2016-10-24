export const itemsSchema = {
	//state.sites.vouchers = {};
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		//state.sites.vouchers.items[ siteId ] = {};
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				//state.sites.vouchers.items[ siteId ][ serviceType ] = [];
				'^[a-z-]+$': {
					type: 'array',
					items: {
						//state.sites.vouchers.items[ siteId ][ serviceType ] = [ {} ];
						type: 'object',
						required: [ 'assigned', 'assigned_by' ],
						additionalProperties: false,
						properties: {
							assigned: { type: 'string' },
							assigned_by: { type: 'number' },
							code: { type: 'string' },
							status: { type: 'string' }
						}
					}
				}
			}
		}
	}
};
