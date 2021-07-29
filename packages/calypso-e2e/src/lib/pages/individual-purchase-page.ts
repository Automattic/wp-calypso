import { Page } from 'playwright';

const selectors = {
	purchaseTitle: ( title: string ) => `.manage-purchase__title:has-text("${ title }")`,
	renewNowCardButton: 'button.card:has-text("Renew Now")',
};

/**
 * Page representing the Purchases page for an individual purchased item (Upgrades >> Purchases >> Select a plan/purchase)
 */
export class IndividualPurchasePage {
	private page: Page;

	/**
	 * Constructs an instance of the Individual Purchase POM.
	 *
	 * @param {Page} page Instance of the Playwright page
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Validates the title of the purchase that this purchase page is for. Throws if it is not the expected title.
	 *
	 * @param {string} expectedPurchaseTitle Expected text for the title of the purchase.
	 * @throws If the expected purchase title is not the title on the page.
	 */
	async validatePurchaseTitle( expectedPurchaseTitle: string ): Promise< void > {
		// TODO: there's a bug making a web requests on this page go really slow (~35 seconds) -- see issue #55028. Remove extra timeout once fixed.
		await this.page.waitForSelector( selectors.purchaseTitle( expectedPurchaseTitle ), {
			timeout: 60 * 1000,
		} );
	}

	/**
	 * Renew purchase by clicking on the "Renew Now" card button (as opposed to the inline "Renew now" button).
	 */
	async clickRenewNowCardButton(): Promise< void > {
		// This triggers a real navigation.
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.renewNowCardButton ),
		] );

		// We're landing on the cart page, which has a lot of async loading, so let's make sure we let everything settle.
		await this.page.waitForLoadState( 'networkidle' );
	}
}
