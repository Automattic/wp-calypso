import { Locator, Page } from 'playwright';

const selectors = {
	buttonText: '[aria-label="Button text"]',
};

/**
 * Represents a Template Part block in the full site editor.
 */
export class ButtonsBlock {
	static blockName = 'Buttons';
	static blockEditorSelector = '[aria-label="Block: Buttons"]';

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
	async enterButtonText( { index, text }: { index: number; text: string } ): Promise< void > {
		const locator = this.block.locator( selectors.buttonText ).nth( index );
		await locator.fill( text );
	}
}
