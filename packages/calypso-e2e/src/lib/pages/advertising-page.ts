import { Page } from 'playwright';
import { envVariables } from '../..';
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
	 * Clicks on a button with the accessible name matching supplied parameter `name`,
	 * narrowed down by either one of the following parameters.
	 *
	 * If the parameter `row` is specified, this method will look for a button
	 * in a specific row. Rows are 0-indexed.
	 *
	 * Alternatively, if the parameter `postTitle` is defined, this method will
	 * click on the button matching the accessible name found in a row with the matching
	 * post title.
	 *
	 * If neither is defined, an error is thrown.
	 *
	 * @param {string} name Accessible name of the button.
	 * @param param1 Keyed object parameter.
	 * @param {number} [param1.row] Row number to look for the button. 0-indexed.
	 * @param {string} [param1.postTitle] Post title to locate the button by.
	 * @throws {Error} If neither `postTitle` or `row` is defined.
	 */
	async clickButtonByNameOnRow(
		name: string,
		{ row, postTitle }: { row?: number; postTitle?: string } = {}
	) {
		// Wait for promote the banner to finish loading on desktop.
		if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
			await this.page
				.getByRole( 'main' )
				.locator( '.posts-list-banner__container, .tsp-banner__container' )
				.waitFor( { timeout: 20 * 1000 } ); // Banner can be pretty slow on some sites.
		}

		if ( row !== undefined && row >= 0 ) {
			await this.page
				.getByRole( 'row' )
				.nth( row + 1 ) // The header row is counted as one row.
				.getByRole( 'button', { name: name } )
				.click();
		} else if ( postTitle ) {
			await this.page
				.getByRole( 'row' )
				.filter( { hasText: postTitle } )
				.getByRole( 'button', { name: name } )
				.click();
		} else {
			throw new Error( `Must pass in either row or postTitle.` );
		}
	}
}
