/**
 * Shared types for the bundled `big-sky/apply-block-edits` fallback ability.
 *
 * These mirror the schema of Big Sky's canonical `big-sky/apply-block-edits`
 * ability (backend-owned contract, emitted by the wpcom block-editing agent as
 * `big_sky__apply_block_edits`). Kept dependency-free so the pure block-edit
 * engine can import them without pulling in `@automattic/agenttic-client`.
 */

export interface BlockData {
	name?: string;
	clientId?: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: BlockData[] | null;
}

export interface BlockUpdate extends BlockData {
	clientId: string;
}

export interface BlockInsert {
	parentClientId?: string | null;
	index?: number;
	block: BlockData;
}

export type BlockDelete = string | { clientId?: string };

export interface ApplyBlockEditsArgs {
	updates?: BlockUpdate[];
	inserts?: BlockInsert[];
	deletes?: BlockDelete[];
	customCSS?: string;
	summary?: string;
	followUpTasks?: boolean;
	reverseMap?: Record< string, string >;
}

export interface ApplyBlockEditsResultData {
	success: boolean;
	message: string;
	error?: string;
	details?: unknown;
}

export interface ApplyBlockEditsResult {
	result: ApplyBlockEditsResultData;
	returnToAgent: boolean;
	agentMessage?: string;
}
