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
		const purchasesListDataView = this.page.locator( '#purchases-list .dataviews-wrapper' );
		const purchasesListCardView = this.page.locator( '.card.purchase-item' );
		await purchasesListDataView.or( purchasesListCardView ).first().waitFor( { state: 'visible' } );

		if ( await purchasesListCardView.isVisible() ) {
			await this.page
				.locator( '.card.purchase-item' )
				.filter( { hasText: name } )
				.filter( { hasText: siteSlug } )
				.click();
			return;
		}

		await this.page
			.locator( '#purchases-list .dataviews-view-table__row' )
			.filter( { hasText: name } )
			.filter( { hasText: siteSlug } )
			.locator( '.dataviews-view-table__actions-column button' )
			.click();
	}

	/* Purchase detail view */

	/**
	 * Clicks a cancellation action for the purchase.
	 *
	 * @param {PurchaseActions} action Action to click.
	 */
	async cancelPurchase( action: PurchaseActions ) {
		await this.page.getByRole( 'link', { name: action } ).click();

		if ( action === 'Cancel plan' || action === 'Cancel subscription' ) {
			await this.page.getByRole( 'button', { name: 'Cancel subscription' } ).click();
		}
	}
}
