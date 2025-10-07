import { Page } from 'playwright';
import { DataHelper } from '../..';

/**
 * Represents the Import Let's Find Your Site page.
 */
export class ImportLetsFindYourSitePage {
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
	 * Navigates to the Let's Find Your Site page for the given site slug.
	 *
	 * @param siteSlug Site slug.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto(
			DataHelper.getCalypsoURL( 'setup/site-migration/site-migration-identify', {
				hide_importer_link: 'true',
				siteSlug,
				isUploadInProgress: 'false',
			} )
		);
	}

	/**
	 * Get the heading for the Let's Find Your Site page.
	 * @returns The heading element for the Let's Find Your Site page.
	 */
	get heading() {
		return this.page.getByRole( 'heading', { name: "Let's find your site" } );
	}

	/**
	 * Enters the given site URL into the site address input and clicks the Check my site button.
	 *
	 * @param url The site URL to enter.
	 */
	async enterSiteURLAndCheck( url: string ): Promise< void > {
		await this.page.getByRole( 'textbox', { name: 'Enter your site address:' } ).fill( url );
		await this.page.getByRole( 'button', { name: 'Check my site' } ).click();
	}
}
