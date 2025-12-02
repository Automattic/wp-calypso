import { Page } from 'playwright';

/**
 * Represents the Import Content WordPress Question page.
 */
export class ImportContentWordPressQuestionPage {
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
	 * Get the heading for the Import Content page.
	 * @returns The heading element for the Import Content page.
	 */
	get heading() {
		return this.page.getByRole( 'heading', { name: 'What do you want to do?' } );
	}

	/**
	 * Click the "Import content only" button.
	 */
	async clickImportContentOnlyButton() {
		await this.page.getByRole( 'button', { name: 'Import content only' } ).click();
	}

	/**
	 * Click the "Migrate site" button.
	 * @returns A promise that resolves when the action is complete.
	 */
	async clickMigrateSiteButton() {
		await this.page.getByRole( 'button', { name: 'Migrate site' } ).click();
	}
}
