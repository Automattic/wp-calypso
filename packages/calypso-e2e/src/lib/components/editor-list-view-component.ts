import { Locator, Page } from 'playwright';

const selectors = {
	blockLink: ( blockName: string ) => `.block-editor-list-view-leaf a:has-text("${ blockName }")`,
};

/**
 * Represents an instance of the WordPress.com Editor's sidebar list view.
 * The component is available only in the Desktop viewport.
 */
export class EditorListViewComponent {
	private page: Page;
	private editor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {Locator} editor Locator or FrameLocator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Clicks the first block entry in the list view that has the provided block name (e.g. "Heading").
	 *
	 * @param {string} blockName Name of the block type (e.g. "Heading").
	 */
	async clickFirstBlockOfType( blockName: string ): Promise< void > {
		const locator = this.editor.locator( selectors.blockLink( blockName ) ).first();
		await locator.click();
	}
}
