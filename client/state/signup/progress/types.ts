import type { Dependencies } from 'calypso/signup/types';
export interface StepState {
	formData: {
		url: string;
	};
	lastUpdated: number;
	providedDependencies?: Dependencies;
	status: 'completed' | 'processing' | 'pending' | 'in-progress' | 'invalid';
	stepName: string;
	wasSkipped?: boolean;
}

export type ProgressState = Record< string, StepState >;
