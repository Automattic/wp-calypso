import { Page } from 'playwright';

const selectors = {
	// Common selectors
	button: ( text: string ) => `button:text-is("${ text }")`,

	// Inputs
	siteTitleInput: ( title: string ) => `input#blogname[value="${ title }"]`,
	siteTaglineInput: ( tagline: string ) => `input#blogdescription[value="${ tagline }"]`,

	// Launch site
	launchSiteButton: 'a:text("Launch site")',

	// Site Tools
	siteSearchInput: `input[type="search"]`,
	confirmSiteLink: ( title: string ) => `a[title="${ title }"]`,
	deleteSiteLinkItem: `p:text-is("Delete your site permanently")`,
	deleteSiteConfirmInput: `input[id="confirmDomainChangeInput"]`,
	deleteSiteConfirmationSpan: 'span:has-text("is being deleted")',
};

/**
 * Represents the Settings > General Settings page.
 */
export class GeneralSettingsPage {
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
	 * Start the site launch process.
	 */
	async launchSite(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.launchSiteButton ),
		] );
	}

	/**
	 * Given title, clicks on the first instance of the link with the text.
	 *
	 * @param {string} title User-visible text on the button.
	 */
	async clickConfirmSiteLink( title: string ): Promise< void > {
		await this.page.click( selectors.confirmSiteLink( title ) );
	}

	/**
	 * Given text, clicks on the first instance of the link with the text.
	 *
	 * @param {string} url URL of the site to be deleted.
	 */
	async confirmSiteToDelete( url: string ): Promise< void > {
		await this.page.fill( selectors.siteSearchInput, url );
	}

	/**
	 * Performs steps related to site deletion.
	 *
	 * @param {string} url URL of the site to be deleted.
	 */
	async deleteSite( url: string ): Promise< void > {
		await this.page.click( selectors.deleteSiteLinkItem );
		await this.page.click( selectors.button( 'Delete site' ) );
		await this.page.fill( selectors.deleteSiteConfirmInput, url );

		// Once the confirmation button is clicked these things happen in short order:
		//	- site deletion confirmation toast is shown.
		//	- navigation to a new page, entering state where no site is selected.
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.waitForSelector( selectors.deleteSiteConfirmationSpan ),
			this.page.click( selectors.button( 'Delete this site' ) ),
		] );
	}

	/**
	 * Validates the provided value is in the Site title input field
	 *
	 * @param {string} title Expected Site title
	 */
	async validateSiteTitle( title: string ): Promise< void > {
		// Because of React state handling, we must wait for the expected input value rather than find the input and return its value.
		// This input is empty when first rendered, then updated with the state. Playwright can outpace React!
		await this.page.waitForSelector( selectors.siteTitleInput( title ) );
	}

	/**
	 * Validates the provided value is in the Site tagline input field
	 *
	 * @param {string} tagline Expected Site tagline
	 */
	async validateSiteTagline( tagline: string ): Promise< void > {
		// Because of React state handling, we must wait for the expected input value rather than find the input and return its value.
		// This input is empty when first rendered, then updated with the state. Playwright can outpace React!
		await this.page.waitForSelector( selectors.siteTaglineInput( tagline ) );
	}
}
