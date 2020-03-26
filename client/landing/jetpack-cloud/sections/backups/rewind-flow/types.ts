export enum RewindFlowPurpose {
	RESTORE,
	DOWNLOAD,
}

export interface RewindConfig {
	themes: boolean;
	plugins: boolean;
	uploads: boolean;
	sqls: boolean;
	roots: boolean;
	contents: boolean;
}

export const defaultRewindConfig: RewindConfig = {
	themes: true,
	plugins: true,
	uploads: true,
	sqls: true,
	roots: true,
	contents: true,
};
