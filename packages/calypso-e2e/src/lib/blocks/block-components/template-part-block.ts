import { Locator, Page } from 'playwright';

const blockEditorSelctor = '[aria-label="Block: Template Part"]';
const selectors = {
	chooseButton: 'button:has-text("Choose")',
	startBlankButton: 'button:has-text("Start blank")',
};

/**
 * Represents a Template Part block in the full site editor.
 */
export class TemplatePartBlock {
	static blockName = 'Template Part';
	static blockEditorSelector = blockEditorSelctor;

	private page: Page;
	block: Locator;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} block Frame-safe locator to the top element of the block.
	 */
	constructor( page: Page, block: Locator ) {
		this.page = page;
		this.block = block;
	}

	/**
	 *
	 */
	async clickStartBlank(): Promise< void > {
		const locator = this.block.locator( selectors.startBlankButton );
		await locator.click();
	}

	/**
	 *
	 */
	async clickChoose(): Promise< void > {
		const locator = this.block.locator( selectors.chooseButton );
		await locator.click();
	}
}
