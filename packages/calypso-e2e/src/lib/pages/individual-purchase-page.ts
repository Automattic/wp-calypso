import { Page } from 'playwright';

const selectors = {
	purchaseTitle: ( title: string ) => `.manage-purchase__title:has-text("${ title }")`,

	// Purchased item actions
	renewNowCardButton: 'button.card:has-text("Renew Now")',
	cancelAndRefundButton: 'a:text("Cancel Subscription and Refund")',
	cancelSubscriptionButton: 'button:text("Cancel Subscription")',

	// Cancellation survey
	whyCancelOptions: 'select[id="inspector-select-control-0"]',
	whyCancelAnotherReasonInput: 'input[id="inspector-text-control-0"]',

	whereNextOptions: 'select[id="inspector-select-control-1"]',
	whereNextAnotherReasonInput: 'input[id="inspector-text-control-1"]',

	// Cancellation
	dismissBanner: '.notice__dismiss',

	button: ( text: string ) => `button:has-text("${ text }")`,
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

	/* Cancellations */

	/**
	 * Cancel the purchase.
	 */
	async cancelPurchase(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.cancelAndRefundButton ),
		] );

		await this.page.click( selectors.cancelSubscriptionButton );

		await this.completeSurvey();
		await this.page.click( selectors.button( 'Cancel plan' ) );

		await this.page.click( selectors.dismissBanner );
	}

	/**
	 * Fill out and submit the cancellation survey.
	 */
	private async completeSurvey(): Promise< void > {
		const reason = 'e2e testing';

		await this.page.selectOption( selectors.whyCancelOptions, { value: 'anotherReasonOne' } );
		await this.page.fill( selectors.whyCancelAnotherReasonInput, reason );

		await this.page.selectOption( selectors.whereNextOptions, { value: 'anotherReasonTwo' } );
		await this.page.fill( selectors.whereNextAnotherReasonInput, reason );
	}
}
