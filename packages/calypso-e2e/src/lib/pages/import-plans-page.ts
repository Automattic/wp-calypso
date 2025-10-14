import { Page } from 'playwright';

/**
 * Represents the Import Plans page.
 */
export class ImportPlansPage {
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
	 * Get the heading for the Import Plans page.
	 * @returns The heading element for the Import Plans page.
	 */
	get heading() {
		return this.page.getByRole( 'heading', { name: 'There is a plan for you' } );
	}
}
