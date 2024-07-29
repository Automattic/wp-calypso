import { Page } from 'playwright';
import { TestFile } from '../../types';
import { EditorComponent } from '../components';

/**
 * Class representing the flow of using a Story block in the editor.
 */
export class StoryBlock {
	// Static properties.
	static blockName = 'Story';
	static blockEditorSelector = `div[aria-label="Block: ${ StoryBlock.blockName }"]`;

	private page: Page;
	private editor: EditorComponent;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {Page} page The underlying page object.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.editor = new EditorComponent( page );
	}

	/**
	 * Given an array of TestFiles, uploads the files to the Story block.
	 *
	 * @param {TestFile[]} files List of files to be uploaded.
	 */
	async upload( files: TestFile[] ): Promise< void > {
		const editorCanvas = await this.editor.canvas();

		for ( const file of files ) {
			// Use of "raw" CSS locators here due to the Story block
			// causing issues with accessibility locators.
			// @see: https://github.com/Automattic/jetpack/issues/32976
			const input = editorCanvas.locator( 'div.components-form-file-upload' ).locator( 'input' );
			await input.setInputFiles( file.fullpath );
			await editorCanvas.locator( '.wp-story-loading-spinner' ).waitFor( { state: 'hidden' } );
		}
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 */
	static async validatePublishedContent( page: Page ) {
		await page.locator( 'main .wp-block-jetpack-story' ).waitFor();
	}
}
