import type { BlockAttributes } from '../../utils/editor-blocks';

/**
 * A block as the agent sends it: an existing one carries its id, a new one
 * does not. A child named by id alone keeps its name.
 */
export interface BlockData {
	name?: string;
	clientId?: string;
	attributes?: BlockAttributes;
	innerBlocks?: BlockData[] | null;
}

/** `innerBlocks` lists existing children by id to reorder them; `null` or absent leaves them be. */
export interface BlockUpdate extends BlockData {
	clientId: string;
	name: string;
}

export interface BlockInsert {
	/** `null` or absent inserts at the top level of the page. */
	parentClientId?: string | null;
	index?: number;
	block: BlockData;
}

/** The edits of one call, after `normalizeEdits()`: every list is an array of usable entries. */
export interface BlockEdits {
	updates: BlockUpdate[];
	inserts: BlockInsert[];
	deletes: string[];
	/** The whole custom CSS of the site, replacing what is there. */
	customCSS?: string;
}

/** Turns the id the agent sent into the editor's clientId. */
export type ResolveClientId = ( id: string ) => string;

export type ChangeType = 'text-content' | 'other';
