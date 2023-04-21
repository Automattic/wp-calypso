import { Page, Frame } from 'playwright';

export type OpenInlineInserter = ( editorCanvas: Page | Frame ) => Promise< void >;
export interface BlockInserter {
	searchBlockInserter( blockName: string ): Promise< void >;
	selectBlockInserterResult(
		name: string,
		options?: { type?: 'block' | 'pattern' }
	): Promise< void >;
}
