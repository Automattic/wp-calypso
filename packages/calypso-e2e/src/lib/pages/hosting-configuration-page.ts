import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

/**
 * Represents the Settings > Hosting Configuration page.
 */
export class HostingConfigurationPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Navigates to the page.
	 *
	 * @param {string} siteSlug Site slug.
	 */
	async visit( siteSlug: string ) {
		await this.page.goto( getCalypsoURL( `hosting-config/${ siteSlug }` ) );
	}

	/**
	 * Given text, clicks on a button with matching text.
	 *
	 * @param {string} text Text to search on the button.
	 */
	async clickButton( text: string ) {
		await this.page.getByRole( 'button', { name: text } ).click();
	}
}
