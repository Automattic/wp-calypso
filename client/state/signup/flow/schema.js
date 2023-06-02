export const currentFlowNameSchema = {
	type: 'string',
};

export const previousFlowNameSchema = {
	type: 'string',
};

export const excludedStepsSchema = {
	type: 'array',
	items: {
		type: 'string',
	},
};
