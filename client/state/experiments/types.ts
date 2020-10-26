/**
 * Internal Dependencies
 */
import { EXPERIMENT_ASSIGN } from 'calypso/state/action-types';

export type ExperimentResponse = {
	variations: object;
	nextRefresh: number;
};

export type ExperimentState = {
	anonId: string | null;
	variations: object | null;
	nextRefresh: number;
	isLoading: boolean;
};

export type ExperimentAssign = ExperimentResponse & {
	type: typeof EXPERIMENT_ASSIGN;
};
