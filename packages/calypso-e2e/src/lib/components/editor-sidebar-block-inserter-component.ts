import { Page } from 'playwright';
import envVariables from '../../env-variables';
import { EditorComponent } from './editor-component';

const sidebarParentSelector = '.block-editor-inserter__main-area';
const selectors = {
	closeBlockInserterButton: 'button[aria-label="Close block inserter"]',
	blockSearchInput: `${ sidebarParentSelector } input[type="search"]`,
	blockResultItem: ( name: string ) =>
		`${ sidebarParentSelector } .block-editor-block-types-list__list-item span:text("${ name }")`,
	patternResultItem: ( name: string ) => `${ sidebarParentSelector } div[aria-label="${ name }"]`,
};

/**
 * Represents the primary, sidebar block inserter in the editor.
 */
export class EditorSidebarBlockInserterComponent {
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
	 * Closes the Block Inserter from the panel.
	 *
	 * This operation is only available for Mobile viewports where the
	 * Block Inserter panel is treated as an overlay.
	 */
	async closeBlockInserter(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			return;
		}

		const editorFrame = await this.editor.getParentFrame();
		const blockInserterPanelLocator = editorFrame.locator( selectors.closeBlockInserterButton );
		if ( ( await blockInserterPanelLocator.count() ) > 0 ) {
			await blockInserterPanelLocator.click();
		}
	}

	/**
	 * Searches the Block Inserter for the provided string.
	 *
	 * @param {string} text Text to enter into the search input.
	 */
	async searchBlockInserter( text: string ): Promise< void > {
		const editorFrame = await this.editor.getParentFrame();
		const locator = editorFrame.locator( selectors.blockSearchInput );
		await locator.fill( text );
	}

	/**
	 * Selects the maching result from the block inserter.
	 *
	 * By default, this method considers only the Block-type results
	 * (including Resuable blocks).
	 * In order to select from Pattern-type results, set the `type`
	 * optional flag in the parameter to `'pattern'`.
	 *
	 * Where mulltiple matches exist (eg. due to partial matching), the first result will be chosen.
	 */
	async selectBlockInserterResult(
		name: string,
		{ type = 'block' }: { type?: 'block' | 'pattern' } = {}
	): Promise< void > {
		const editorFrame = await this.editor.getParentFrame();
		let locator;

		if ( type === 'pattern' ) {
			locator = editorFrame.locator( selectors.patternResultItem( name ) ).first();
		} else {
			locator = editorFrame.locator( selectors.blockResultItem( name ) ).first();
		}

		await Promise.all( [ locator.hover(), locator.focus() ] );
		await locator.click();
	}
}
