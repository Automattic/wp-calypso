/**
 * External dependencies
 */
import { Browser, Page } from 'playwright';

/**
 * Represents an incognito browser context and page for testing purposes.
 */
export class IncognitoPage {
	/**
	 * Reference to the Playwright page object.
	 */
	private browser: Browser;
	private page: Page | undefined;

	/**
	 * Constructs a new IncognitoPage instance.
	 *
	 * @param browser - The Playwright Browser object.
	 */
	constructor( browser: Browser ) {
		this.browser = browser;
	}

	/**
	 * Spawns a new incognito browser context and page.
	 *
	 * @returns Promise that resolves when the context and page are ready.
	 */
	async spawn(): Promise< void > {
		const context = await this.browser.newContext();
		this.page = await context.newPage();
	}

	/**
	 * Gets the underlying Playwright page object.
	 * @returns The Playwright page object.
	 * @throws Error if the page has not been initialized.
	 */
	getPage(): Page {
		if ( ! this.page ) {
			throw new Error( 'Incognito page has not been initialized. Call spawn() first.' );
		}
		return this.page;
	}

	/**
	 * Navigates to the specified URL in the incognito page.
	 * @param url The URL to navigate to.
	 * @throws Error if the page has not been initialized.
	 */
	async goto( url: string ): Promise< void > {
		if ( ! this.page ) {
			throw new Error( 'Incognito page has not been initialized. Call spawn() first.' );
		}
		await this.page.goto( url );
	}

	/**
	 * Gets the text content of the entire page.
	 * @returns The text content of the entire page.
	 * @throws Error if the page has not been initialized.
	 */
	async getPageText(): Promise< string > {
		if ( ! this.page ) {
			throw new Error( 'Incognito page has not been initialized. Call spawn() first.' );
		}
		return ( await this.page.locator( 'html' ).textContent() ) || '';
	}

	/**
	 * Closes the incognito browser context and page.
	 * @returns Promise that resolves when the context and page are closed.
	 */
	async close(): Promise< void > {
		if ( this.page ) {
			await this.page.context().close();
			this.page = undefined;
		}
	}
}
