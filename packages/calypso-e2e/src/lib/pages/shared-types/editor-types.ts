import { Locator } from 'playwright';

export type OpenInlineInserter = ( editorCanvas: Locator ) => Promise< void >;
export interface BlockInserter {
	searchBlockInserter( blockName: string ): Promise< void >;
	selectBlockInserterResult(
		name: string,
		options?: { type?: 'block' | 'pattern'; blockFallBackName?: string }
	): Promise< Locator >;
}
