import { Page } from 'playwright';
import { EditorWindow } from './editor-window';

const popoverParentSelector = '.block-editor-inserter__quick-inserter';
const selectors = {
	searchInput: `${ popoverParentSelector } input[type=search]`,
};

/**
 * Represents the inline, popover block inserter in the editor.
 */
export class EditorInlineBlockInserterComponent {
	private page: Page;
	private editorWindow: EditorWindow;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorWindow} editorWindow The EditorWindow instance.
	 */
	constructor( page: Page, editorWindow: EditorWindow ) {
		this.page = page;
		this.editorWindow = editorWindow;
	}

	/**
	 * Searches the Block Inserter for the provided string.
	 *
	 * @param {string} text Text to enter into the search input.
	 */
	async searchBlockInserter( text: string ): Promise< void > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		const locator = editorFrame.locator( selectors.searchInput );
		await locator.fill( text );
	}

	/**
	 * Selects the maching result from the block inserter.
	 *
	 * Where mulltiple matches exist (eg. due to partial matching), the first
	 * result will be chosen.
	 */
	async selectBlockInserterResult( name: string ): Promise< void > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		await editorFrame.getByRole( 'option', { name, exact: true } ).first().click();
	}
}
