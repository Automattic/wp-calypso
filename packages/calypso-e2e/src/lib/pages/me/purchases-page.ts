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
	 * Clicks a cancellation action for the purchase.
	 *
	 * For refundable purchases the cancel-purchase page surfaces a "Remove plan
	 * and claim refund." opt-in alongside the default "Cancel subscription"
	 * (auto-renew disable) button. Tests need the purchase fully removed so the
	 * next test starts from a clean account, so we prefer the refund opt-in
	 * when it's present.
	 *
	 * @param {PurchaseActions} action Action to click.
	 */
	async cancelPurchase( action: PurchaseActions ) {
		await this.page.getByRole( 'link', { name: action } ).click();

		const claimRefund = this.page.getByRole( 'button', {
			name: 'Remove plan and claim refund.',
		} );
		const cancelSubscription = this.page.getByRole( 'button', { name: 'Cancel subscription' } );

		await claimRefund.or( cancelSubscription ).first().waitFor( { state: 'visible' } );

		if ( await claimRefund.isVisible() ) {
			await claimRefund.click();
		} else {
			await cancelSubscription.click();
		}
	}
}
