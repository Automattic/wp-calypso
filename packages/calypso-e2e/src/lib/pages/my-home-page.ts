import { Locator, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	visitSiteButton: '.button >> text=Visit site',
	domainUpsellCard: `.domain-upsell__card`,
	domainUpsellSuggestedDomain: `.domain-upsell__card .domain-upsell-illustration`,
	domainUpsellBuyDomain: ( message: string ) =>
		`.domain-upsell-actions button:text("${ message }")`,
};

/**
 * Page representing the WPCOM home dashboard.
 */
export class MyHomePage {
	private page: Page;
	private anchor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.anchor = page.getByRole( 'main' );
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
	 * Get the suggested domain in the upsell card.
	 *
	 * @returns {string} Suggested domain. Empty string if not found.
	 */
	async getSuggestedUpsellDomain(): Promise< string > {
		// It's important to wait for an actual svg element to be present.
		// The handling here is a little funky. We take a blank palceholder img, then we
		// draw an SVG with just the text on top of it.
		// There's a race condition where the placeholder img can render before the the text svg does.
		const svgLocator = this.anchor.locator( '.domain-upsell-illustration svg' );

		// But, innerText doesn't work on SVG nodes, so we need this locator to actually fetch the text.
		const parentDivLocator = this.anchor.locator( '.domain-upsell-illustration' );
		try {
			await svgLocator.waitFor();
			return await parentDivLocator.innerText();
		} catch {
			return '';
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
