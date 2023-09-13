import type { Dependencies } from 'calypso/signup/types';

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
				status: {
					type: 'string',
					enum: [ 'completed', 'processing', 'pending', 'in-progress', 'invalid' ],
				},
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
	providedDependencies?: Dependencies;
	status: 'completed' | 'processing' | 'pending' | 'in-progress' | 'invalid';
	stepName: string;
	wasSkipped?: boolean;
	domainForm?: {
		subdomainSearchResults: Array< {
			domain_name: string;
			isSubDomainSuggestion: boolean;
			is_free: boolean;
			vendor: 'dot';
		} >;
		lastDomainSearched: string;
	};
}

export type ProgressState = Record< string, StepState >;
