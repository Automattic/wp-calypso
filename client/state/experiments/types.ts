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
	type: string;
};
