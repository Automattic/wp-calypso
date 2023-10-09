import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

/**
 * Represents the Pages page.
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
	 * @param param0 Keyed object parameter.
	 * @param {string} param0.siteSlug Site slug.
	 * @param {number} param0.timeout Custom timeout.
	 *
	 * Example {@link https://wordpress.com/pages}
	 * Example {@link https://wordpress.com/pages/usersiteslug.wordpress.com}
	 */
	async visit( { siteSlug, timeout }: { siteSlug?: string; timeout?: number } = {} ) {
		const url = `pages/${ siteSlug }`;
		await this.page.goto( getCalypsoURL( url ), { timeout: timeout } );

		// Wait for page entries (if any) to load. This also waits for the page to settle.
		await this.page.locator( '.is-placeholder' ).waitFor( { state: 'detached', timeout: timeout } );
	}

	/**
	 * Start a new page using the 'Add new page' button.
	 */
	async addNewPage() {
		await this.page.getByRole( 'link', { name: /(Add new|Start a) page/ } ).click();
	}
}
