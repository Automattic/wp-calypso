import { Page } from 'playwright';

/**
 * Represents the Import Let's Us Migrate Your Site page.
 */
export class ImportLetUsMigrateYourSitePage {
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
	 * Get the heading for the Let us migrate your site page.
	 * @returns The heading element for the Let us migrate your site page.
	 */
	get heading() {
		return this.page.getByRole( 'heading', { name: 'Let us migrate your site' } );
	}

	/**
	 * Clicks the "Get Started" button.
	 */
	async clickGetStarted(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Get Started' } ).click();
	}
}
