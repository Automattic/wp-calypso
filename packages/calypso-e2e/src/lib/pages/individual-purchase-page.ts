import { Page } from 'playwright';

const selectors = {
	// Shared
	purchaseTitle: ( title: string ) => `.manage-purchase__title:has-text("${ title }")`,
	autoRenewToggle: 'input.components-form-toggle__input',
	modalConfirm: 'button[data-tip-target="dialog-base-action-confirm"]',
	radioButton: ( value: string ) => `input[type="radio"][value=${ value }]`,
	modalSubmit: 'button[data-e2e-button="submit"]',
	button: ( text: string ) => `button:has-text("${ text }")`,

	// Purchased item actions: plans
	renewNowCardButton: 'button.card:has-text("Renew Now")',
	cancelAndRefundButton: 'a:text("Cancel Subscription and Refund")',
	cancelSubscriptionButton: 'button:text("Cancel Subscription")',

	// Purchased item actions: domains
	deleteDomainCard: 'a:has-text("Delete your domain permanently")',
	cancelDomainButton: 'button:has-text("Cancel Domain and Refund")',
	cancelDomainReasonOption: 'select.confirm-cancel-domain__reasons-dropdown form-select',
	cancelDomainReasonTextArea: 'textarea.confirm-cancel-domain__reason-details',
	cancelDomainCheckbox: 'input.form-checkbox',

	// Cancellation survey
	whyCancelOptions: 'select[id="inspector-select-control-0"]',
	whyCancelAnotherReasonInput: 'input[id="inspector-text-control-0"]',

	whereNextOptions: 'select[id="inspector-select-control-1"]',
	whereNextAnotherReasonInput: 'input[id="inspector-text-control-1"]',

	// Cancellation
	dismissBanner: '.notice__dismiss',
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

	/**
	 * Toggle off domain auto renew.
	 */
	async turnOffAutoRenew(): Promise< void > {
		await this.page.click( selectors.autoRenewToggle );
		await this.page.click( selectors.modalConfirm );
		await this.page.click( selectors.radioButton( 'not-sure' ) );
		await this.page.click( selectors.modalSubmit );
		await this.page.waitForSelector( ':text-matches("successfully")' );
	}

	/* Domain Purchase actions */

	/**
	 * If the individual purchase shown on page is of type domain,
	 * execute the delete domain flow.
	 *
	 * Note that flow of domain cancellation is different depending on
	 * whether the domain is within the cancellatio and refund window
	 * or not.
	 *
	 * This flow is for domains that are within the refund window.
	 * Test developers intending to cancel a domain past this window
	 * should implement such path.
	 */
	async deleteDomain(): Promise< void > {
		await this.page.click( selectors.deleteDomainCard );
		await this.page.click( selectors.cancelDomainButton );
		await this.page.selectOption( selectors.cancelDomainReasonOption, 'other' );
		await this.page.fill( selectors.cancelDomainReasonTextArea, 'e2e testing' );
		await this.page.check( selectors.cancelDomainCheckbox );

		await Promise.all( [
			this.page.waitForNavigation( { timeout: 60000 } ),
			this.page.click( selectors.button( 'Cancel Domain' ) ),
		] );
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
