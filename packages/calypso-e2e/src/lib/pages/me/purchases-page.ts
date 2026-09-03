import { Page } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';

type PurchaseActions = 'Cancel plan' | 'Cancel subscription';

/**
 * Represents the /me endpoint.
 */
export class PurchasesPage {
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
	 * Visits the /me endpoint.
	 */
	async visit() {
		await this.page.goto( getCalypsoURL( 'me/purchases' ) );
	}

	/* Purchases list view */

	/**
	 * Clicks on the matching purchase.
	 *
	 * @param {string} name Name of the purchased subscription.
	 * @param {string} siteSlug Site slug.
	 */
	async clickOnPurchase( name: string, siteSlug: string ) {
		await this.page
			.locator( '#purchases-list .dataviews-view-table__row' )
			.filter( { hasText: name } )
			.filter( { hasText: siteSlug } )
			.locator( '.purchase-item__title-link' )
			.click();
	}

	/* Purchase detail view */

	/**
	 * Clicks a cancellation action for the purchase and advances to its
	 * cancellation survey via the refund-and-remove path.
	 *
	 * "Cancel plan" / "Cancel subscription" lands on a cancellation confirmation
	 * screen (`intent=cancel`) whose primary action only disables auto-renew — it
	 * no longer issues a refund. To drive the immediate refund-and-remove path
	 * (the one the cancellation specs assert), this follows the "Remove and claim
	 * refund." notice link on that screen, which navigates to the same route under
	 * `intent=remove` where the primary confirm button reads "Continue removal".
	 * Confirming there begins the cancellation survey, which fires the refund on
	 * completion.
	 *
	 * @param {PurchaseActions} action Action link to click on the purchase detail view.
	 */
	async cancelPurchase( action: PurchaseActions ) {
		await this.page.getByRole( 'link', { name: action } ).click();

		// Follow the refund-eligibility notice link to switch from the
		// auto-renew-only `intent=cancel` screen to the refund-and-remove
		// `intent=remove` screen. Matched by a copy-resilient pattern so wording
		// tweaks to the notice don't break the flow.
		await this.page.getByRole( 'button', { name: /claim refund/i } ).click();

		// The screen remounts under `intent=remove`. Wait for its primary
		// "Continue removal" button before interacting.
		const continueRemovalButton = this.page.getByRole( 'button', {
			name: 'Continue removal',
			exact: true,
		} );
		await continueRemovalButton.waitFor( { state: 'visible' } );

		// Under the split-cancel-remove flag the confirm button is gated behind an
		// "I've reviewed what I'll lose…" checkbox; without the flag there is no
		// checkbox and the button is enabled immediately. Tick it only when present
		// so the flow works regardless of the served variant.
		const confirmCheckbox = this.page.locator( 'label.cancel-purchase__confirm-checkbox input' );
		if ( ( await confirmCheckbox.count() ) > 0 ) {
			await confirmCheckbox.check();
		}

		// Confirm. Clicking "Continue removal" begins the cancellation survey.
		await continueRemovalButton.click();
	}
}
