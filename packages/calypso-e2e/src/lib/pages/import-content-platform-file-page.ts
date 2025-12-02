import { Page } from 'playwright';

/**
 * Represents the Import Content from Another Platform or File page.
 */
export class ImportContentFromAnotherPlatformOrFilePage {
	private page: Page;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Gets the heading element on the page.
	 *
	 * @returns The heading element.
	 */
	get heading() {
		return this.page.getByRole( 'heading', {
			name: 'Import content from another platform or file',
		} );
	}

	/**
	 * Clicks the "WordPress" option button.
	 * @returns A promise that resolves when the action is complete.
	 */
	async clickWordPressOption(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'WordPress' } ).click();
	}
}
