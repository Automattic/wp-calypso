import { Page } from 'playwright';

/**
 * Represents the free user signup flow at setup/free/freeSetup.
 *
 * @see https://wordpress.com/setup/free/freeSetup
 * @see paYE8P-2bD-p2
 */
export class FreeSignupFlow {
	private page: Page;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Clicks on a button with the exact matching string.
	 *
	 * @param {string} buttonText Text on the button to click.
	 */
	async clickButton( buttonText: string ): Promise< void > {
		await this.page.getByRole( 'button', { name: buttonText, exact: true } ).click();
	}

	/**
	 * Enters the site name.
	 *
	 * Note that in this flow, the site name will form part of the domain name.
	 *
	 * Example:
	 * 	freetestsite1234 -> freetestsite.wordpress.com
	 *
	 * @param {string} name Name of the site.
	 */
	async enterSiteName( name: string ): Promise< void > {
		await this.page.getByRole( 'textbox', { name: 'Site name' } ).fill( name );
	}

	/**
	 * Enters description of the site.
	 *
	 * @param {string} description Description of the site.
	 */
	async enterDescription( description: string ): Promise< void > {
		await this.page.getByLabel( 'Brief description' ).fill( description );
	}

	/**
	 * Selects a style matching the name.
	 *
	 * @param {string} name Name of the style.
	 */
	async pickDesign( name: string ): Promise< void > {
		// await this.page.getByText( name ).click();

		const designLocator = this.page.locator(
			`.design-button-container:has(span:has-text("${ name }"))`
		);
		await designLocator.click();

		// FSE styles present a screen to choose a style and a button to
		// continue with default options, while normal themes only show
		// a preview and a button to select the theme.
		await Promise.race( [
			this.clickButton( 'Continue' ),
			this.clickButton( `Start with ${ name }` ),
		] );
	}
}
