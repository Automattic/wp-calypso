import { Page, Response } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

/**
 * Represents the Pages page
 */
export class PagesPage {
	private page: Page;

	/**
	 * Creates an instance of the page.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Opens the Pages page.
	 *
	 * Example {@link https://wordpress.com/pages}
	 */
	async visit(): Promise< Response | null > {
		const response = await this.page.goto( getCalypsoURL( 'pages' ) );
		return response;
	}

	/**
	 * Start a new page using the 'Add new page' button.
	 */
	async addNewPage( { timeout }: { timeout?: number } = {} ): Promise< void > {
		const button = this.page.getByRole( 'link', { name: /(Add new|Start a) page/ } );
		await button.waitFor( { timeout: timeout } );
		await button.click();

		await this.page.waitForURL( /(page|post_type=page)/, { timeout: timeout } );
	}
}
