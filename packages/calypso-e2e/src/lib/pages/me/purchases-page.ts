import { Page } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';

type PurchaseActions =
	| 'Renew annually'
	| 'Renew monthly'
	| 'Pick another plan'
	| 'Remove plan'
	| 'Cancel plan';

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
			.locator( '.card.purchase-item' )
			.filter( { hasText: name } )
			.filter( { hasText: siteSlug } )
			.click();
	}

	/* Purchase detail view */

	/**
	 * Clicks on an action for the purchase.
	 *
	 * @param {PurchaseActions} action Action to click.
	 */
	async purchaseAction( action: PurchaseActions ) {
		if ( action === 'Pick another plan' ) {
			await this.page.getByRole( 'link', { name: action } ).click();
			return await this.page.waitForURL( /plan/ );
		}

		await Promise.race( [
			this.page.getByRole( 'button', { name: action } ).click(),
			this.page.getByRole( 'link', { name: action } ).click(),
		] );

		if ( action === 'Cancel plan' ) {
			await this.page.getByRole( 'button', { name: 'Cancel Subscription' } ).click();
		}
	}
}
