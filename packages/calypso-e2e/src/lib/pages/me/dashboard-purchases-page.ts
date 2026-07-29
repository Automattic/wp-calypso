import { Page } from 'playwright';
import { getDashboardURL } from '../../../data-helper';

/**
 * Represents the Billing > Active upgrades screens (`/me/billing/purchases`)
 * of the Multi-site Dashboard.
 */
export class DashboardPurchasesPage {
	private page: Page;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Waits until the browser is on the correct Billing page in the Multi-site Dashboard.
	 *
	 * Guards against acting on the wrong page (eg. after an unexpected redirect):
	 * waiting for the domains URL first frames such a failure clearly instead of
	 * surfacing a confusing missing-button locator error.
	 */
	private async waitForPageLoaded( purchasesPage: 'list' | 'details' ) {
		const dashboardHost = new URL( getDashboardURL() ).host;
		await this.page.waitForURL(
			( url ) =>
				url.host === dashboardHost &&
				( purchasesPage === 'list'
					? url.pathname === '/me/billing/purchases'
					: /^\/me\/billing\/purchases\/\d+$/.test( url.pathname ) )
		);
	}

	/* Purchases list view */

	/**
	 * Clicks on the matching purchase.
	 *
	 * @param name Name of the purchased subscription.
	 * @param siteSlug Site slug.
	 */
	async clickOnPurchase( name: string, siteSlug: string ) {
		await this.waitForPageLoaded( 'list' );
		await this.page
			.getByRole( 'row' )
			.filter( { hasText: name } )
			.filter( { hasText: siteSlug } )
			.getByRole( 'link', { name: name } )
			.click();
	}

	/* Purchase detail view */

	/**
	 * Cancels the purchase via the refund-and-remove path and advances to its
	 * cancellation survey.
	 *
	 * The "Cancel" action on the purchase settings screen lands on a
	 * cancellation confirmation screen (`intent=cancel`) whose primary action
	 * only disables auto-renew — it no longer issues a refund. To drive the
	 * immediate refund-and-remove path (the one the cancellation specs assert),
	 * this follows the "Remove plan and claim refund." notice link, which
	 * navigates to the same route under `intent=remove` where the primary
	 * confirm button reads "Continue removal". Confirming there begins the
	 * cancellation survey, which fires the refund on completion.
	 */
	async cancelPurchase() {
		await this.waitForPageLoaded( 'details' );

		await this.page
			.locator( '.action-item' )
			.filter( { hasText: 'Cancel subscription' } )
			.getByRole( 'button', { name: 'Cancel', exact: true } )
			.click();

		// Follow the refund-eligibility notice link to switch from the
		// auto-renew-only `intent=cancel` screen to the refund-and-remove
		// `intent=remove` screen. Matched by a copy-resilient pattern so wording
		// tweaks to the notice don't break the flow.
		await this.page.getByRole( 'link', { name: /claim refund/i } ).click();

		// The screen remounts under `intent=remove`. Wait for its primary confirm
		// button before inspecting the rest of the screen.
		const cancelSubscriptionButton = this.page.getByRole( 'button', {
			name: 'Continue removal',
			exact: true,
		} );
		await cancelSubscriptionButton.waitFor( { state: 'visible' } );

		// The confirm button is gated behind an "I've reviewed what I'll lose…"
		// checkbox. Tick it only when present so the flow still works if the
		// confirmation screen drops it.
		const confirmCheckbox = this.page.getByRole( 'checkbox', { name: /reviewed what/i } );
		if ( ( await confirmCheckbox.count() ) > 0 ) {
			await confirmCheckbox.check();
		}

		// Confirm. Clicking "Continue removal" begins the cancellation survey.
		await cancelSubscriptionButton.click();
	}
}
