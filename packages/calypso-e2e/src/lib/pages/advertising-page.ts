import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { clickNavTab } from '../../element-helper';

type AdvertisingTab = 'Ready to promote' | 'Campaigns';

/**
 * Page representing the Tools > Advertising page.
 */
export class AdvertisingPage {
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
	 * Navigates directly to the Advertising page for the site.
	 *
	 * @param {string} siteSlug Site slug.
	 */
	async visit( siteSlug: string ) {
		await this.page.goto( getCalypsoURL( `advertising/${ siteSlug }` ) );
	}

	/**
	 * Click on the tab name matching the given parameter `name`.
	 *
	 * @param {AdvertisingTab} name Name of the tab to click on the top of the page.
	 */
	async clickTab( name: AdvertisingTab ) {
		await clickNavTab( this.page, name );
	}

	/**
	 * Clicks on a button with the accessible name matching the supplied parameter `name`.
	 *
	 * If the optional parameter `row` is specified, this method will look for a button
	 * in a specific row. Rows are 0-indexed.
	 *
	 * @param {string} name Accessible name of the button.
	 * @param param1 Keyed object parameter.
	 * @param {number} [param1.row] Row number to look for the button. 0-indexed.
	 */
	async clickButton( name: string, { row }: { row?: number } = {} ) {
		if ( row !== undefined ) {
			await this.page
				.getByRole( 'row' )
				.nth( row + 1 ) // The header row is counted as one row.
				.getByRole( 'button', { name: name } )
				.click();
		} else {
			await this.page.getByRole( 'button', { name: name } ).click();
		}
	}
}
