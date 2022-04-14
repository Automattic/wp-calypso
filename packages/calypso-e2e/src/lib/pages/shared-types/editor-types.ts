import { Locator } from 'playwright';

export type OpenInlineInserter = ( editor: Locator ) => Promise< void >;
export interface BlockInserter {
	searchBlockInserter( blockName: string ): Promise< void >;
	selectBlockInserterResult(
		name: string,
		options?: { type?: 'block' | 'pattern' }
	): Promise< void >;
}
