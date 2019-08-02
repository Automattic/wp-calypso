export const schema = {
	type: 'object',
	patternProperties: {
		'^[w-]+$': {
			type: 'object',
			properties: {
				formData: {
					type: 'object',
					properties: {
						url: { type: 'string' },
					},
				},
				lastUpdated: { type: 'number' },
				// Valid status values: 'completed', 'processing', 'pending', 'in-progress' and 'invalid'
				status: { type: 'string' },
				stepName: { type: 'string' },
			},
		},
	},
};

export interface StepState {
	formData: {
		url: string;
	};
	lastUpdated: number;
	providedDependencies?: string[];
	status: 'completed' | 'processing' | 'pending' | 'in-progress' | 'invalid';
	stepName: string;
}

export type ProgressState = Record< string, StepState >;
