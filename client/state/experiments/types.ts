export type ExperimentResponse = {
	tests: object;
	nextRefresh: number;
};

export type ExperimentState = {
	anonId: string | null;
	tests: object | null;
	nextRefresh: number;
	isLoading: boolean;
};

export type ExperimentAssign = ExperimentResponse & {
	type: string;
};
