export const continentsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^[A-Z][a-zA-Z/_-]+$': {
			type: 'array',
			items: { type: 'string' },
		},
	},
};

export const rawOffsetsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^UTC[-+][0-9.]+$': { type: 'string' },
	},
};

export const labelsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^[A-Z][a-zA-Z/_-]+$': { type: 'string' },
	},
};
