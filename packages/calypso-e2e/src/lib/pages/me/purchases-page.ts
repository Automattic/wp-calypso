import { Page } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';

/**
 * Represents the Multi-site Dashboard's "Active upgrades" screens, at
 * `/me/billing/purchases`.
 *
 * Every newly registered user is enrolled in the hosting dashboard rollout, so
 * they are redirected here from the classic `/me/purchases` routes.
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
	 * Visits the purchases list.
	 *
	 * Entered through the classic route and follows the redirect, because the
	 * dashboard's host varies by environment.
	 */
	async visit() {
		await this.page.goto( getCalypsoURL( 'me/purchases' ) );

		try {
			await this.page.waitForURL( /\/me\/billing\/purchases/ );
		} catch {
			throw new Error(
				`Expected the classic purchases route to redirect to the dashboard, but landed on ${ this.page.url() }.\n` +
					'The user this test signed up was not enrolled in the hosting dashboard rollout. ' +
					'Check NEW_USER_ID_THRESHOLD and the dashboard/enable-percentage-rollout flag in ' +
					'client/dashboard/utils/hosting-dashboard-enrollment.ts — if new users are no longer ' +
					'enrolled by default, they fall back to a 50% cohort and this fails half the time.'
			);
		}
	}

	/* Purchases list view */

	/**
	 * Clicks on the matching purchase.
	 *
	 * The list is a DataViews table: the product cell links to the purchase and
	 * the description cell carries the site slug.
	 *
	 * @param {string} name Name of the purchased subscription.
	 * @param {string} siteSlug Site slug.
	 */
	async clickOnPurchase( name: string, siteSlug: string ) {
		await this.page
			.getByRole( 'row' )
			.filter( { hasText: siteSlug } )
			.getByRole( 'link', { name } )
			.click();
	}

	/* Purchase detail view */

	/**
	 * Cancels the purchase and confirms, leaving the page on the first step of
	 * the cancellation survey.
	 *
	 * The button is labelled "Cancel" for plans and add-ons alike.
	 */
	async cancelPurchase() {
		await this.page.getByRole( 'button', { name: 'Cancel', exact: true } ).click();

		// The confirm button is disabled until this is ticked. Matched on a
		// fragment to avoid the curly apostrophes in the full label.
		await this.page.getByRole( 'checkbox', { name: /reviewed what/i } ).check();

		await this.page.getByRole( 'button', { name: 'Cancel subscription', exact: true } ).click();
	}
}
