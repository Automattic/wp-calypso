import { Locator, Page } from 'playwright';

const selectors = {
	chooseButton: 'button:has-text("Choose")',
	startBlankButton: 'button:has-text("Start blank")',
	addBlockButton: 'button[aria-label="Add block"]',
};

/**
 * Represents a Template Part block in the full site editor.
 */
export class TemplatePartBlock {
	static blockName = 'Template Part';
	static blockEditorSelector = 'div[aria-label="Block: Template Part"]';

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} block Frame-safe locator to the top element of the block.
	 */
	constructor(
		private page: Page,
		public block: Locator
	) {}

	/**
	 * Click the "Start blank" button from the initial state..
	 */
	async clickStartBlank(): Promise< void > {
		const locator = this.block.locator( selectors.startBlankButton );
		await locator.click();
	}

	/**
	 * Click the "Choose" button from the initial state.
	 */
	async clickChoose(): Promise< void > {
		const locator = this.block.locator( selectors.chooseButton );
		await locator.click();
	}

	/**
	 * Clicks the add block button within this parent Template Part
	 */
	async clickAddBlockButton(): Promise< void > {
		const locator = this.block.locator( selectors.addBlockButton );
		await locator.click();
	}
}

/**
 * Represents a Header block in the full site editor.
 * This is just a Template Part block with different name and slightly different parent element markup.
 */
export class HeaderBlock extends TemplatePartBlock {
	static blockName = 'Header';
	static blockEditorSelector = 'header[aria-label="Block: Header"]';
}

/**
 * Represents a Footer block in the full site editor.
 * This is just a Template Part block with different name and slightly different parent element markup.
 */
export class FooterBlock extends TemplatePartBlock {
	static blockName = 'Footer';
	static blockEditorSelector = 'footer[aria-label="Block: Template Part"]';
}
