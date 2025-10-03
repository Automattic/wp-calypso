export type StagingSyncOptions =
	| string[]
	| { types: string; include_paths: string; exclude_paths: string }
	| undefined;

export interface StagingSyncResponse {
	message: string;
}
