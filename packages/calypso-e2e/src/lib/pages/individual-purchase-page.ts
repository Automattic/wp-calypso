import { Page } from 'playwright';

const selectors = {
	purchaseTitle: '.manage-purchase__title',
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
	 * Validates the title of purchase that this purchase page is for.
	 *
	 * @param expectedPurchaseTitle Expected text for the title of the purchase
	 */
	async validatePurchaseTitle( expectedPurchaseTitle: string ): Promise< void > {
		await this.page.waitForSelector(
			`${ selectors.purchaseTitle }:has-text("${ expectedPurchaseTitle }")`
		);
	}

	/**
	 * Renew purchase by clicking on the "Renew Now" card button (as opposed to the inline "Renew now" button)
	 */
	async clickRenewNowCardButton(): Promise< void > {
		// This triggers a real navigation
		await Promise.all( [
			await this.page.waitForNavigation(),
			await this.page.click( selectors.renewNowCardButton ),
		] );

		// we're landing on the cart page, which has a lot of async-like requests
		await this.page.waitForLoadState( 'networkidle' );
	}
}
