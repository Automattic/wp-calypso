import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const popoverParentSelector = '.block-editor-inserter__quick-inserter';
const selectors = {
	searchInput: `${ popoverParentSelector } input[type=search]`,
};

/**
 * Represents the inline, popover block inserter in the editor.
 */
export class EditorInlineBlockInserterComponent {
	private page: Page;
	private editor: EditorComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorComponent} editor The EditorComponent instance.
	 */
	constructor( page: Page, editor: EditorComponent ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Searches the Block Inserter for the provided string.
	 *
	 * @param {string} text Text to enter into the search input.
	 */
	async searchBlockInserter( text: string ): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
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
		const editorFrame = await this.editor.getEditorFrame();
		await editorFrame.getByRole( 'option', { name, exact: true } ).first().click();
	}
}
