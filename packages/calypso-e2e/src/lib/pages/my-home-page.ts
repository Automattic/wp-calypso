import { Locator, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	visitSiteButton: '.button >> text=Visit site',
	domainUpsellBuyDomain: ( message: string ) =>
		`.domain-upsell-actions button:text("${ message }")`,
};

/**
 * Page representing the WPCOM home dashboard.
 */
export class MyHomePage {
	private page: Page;
	private anchor: Locator;
	readonly heading: Locator;
	readonly suggestedUpsellDomainName: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.anchor = page.getByRole( 'main' );
		this.heading = this.page.getByRole( 'heading', { name: 'My Home' } );
		// The <strong> renders empty until the domain suggestion query resolves.
		this.suggestedUpsellDomainName = this.anchor.getByTestId( 'domain-upsell-domain-name' );
	}

	/**
	 * Visits the `/home` endpoint.
	 *
	 * @param {string} siteSlug Site URL.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto( getCalypsoURL( `/home/${ siteSlug }` ), {
			timeout: 20 * 1000,
		} );
	}

	/**
	 * Click on the Visit Site button on the home dashboard.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async visitSite(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.visitSiteButton ),
		] );
	}

	/**
	 * Clicks on the button with matching text.
	 *
	 * @param {string|RegExp} text Text to match on the button.
	 */
	async clickButton( text: string | RegExp ): Promise< void > {
		await this.anchor.getByRole( 'button', { name: text } ).click();
	}

	/**
	 * Returns whether a heading matching the text is present.
	 *
	 * Returns true if present. False otherwise.
	 *
	 * @param {string|RegExp} text Text to match on for the card title.
	 */
	async isHeadingPresent( text: string | RegExp ): Promise< boolean > {
		try {
			await this.anchor.getByRole( 'heading', { name: new RegExp( text ) } ).waitFor();
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Click on Buy this Domain button on the domain Upsell.
	 *
	 * @param {string} buyDomainButton Button text to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickBuySuggestedDomain( buyDomainButton: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.domainUpsellBuyDomain( buyDomainButton ) ),
		] );
	}

	/**
	 * Given a partial or full string, verify that a message containing
	 * the string is shown on the Task card heading.
	 *
	 * @param {string} message Partial or fully matching text to search.
	 */
	async validateTaskHeadingMessage( message: string ): Promise< void > {
		await this.page.getByRole( 'heading', { name: message } ).waitFor();
	}
}
