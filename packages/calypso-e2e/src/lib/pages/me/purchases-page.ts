import { Page } from 'playwright';
import { getCalypsoURL } from '../../../data-helper';

/**
 * Represents the Multi-site Dashboard's "Active upgrades" screens, rooted at
 * `/me/billing/purchases`.
 *
 * Users enrolled in the hosting dashboard rollout — which now includes every
 * newly registered user — are redirected here from the classic `/me/purchases`
 * routes, so this is the only purchase management UI a new user can reach.
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
	 * Entered through the classic route so the app itself works out where the
	 * dashboard lives: it is served from a different host, and which host that is
	 * varies by environment. Following the redirect keeps this working everywhere
	 * without the caller having to know the dashboard's origin.
	 */
	async visit() {
		await this.page.goto( getCalypsoURL( 'me/purchases' ) );
		await this.page.waitForURL( /\/me\/billing\/purchases/ );
	}

	/* Purchases list view */

	/**
	 * Clicks on the matching purchase.
	 *
	 * The list renders as a DataViews table in which the product cell links to
	 * the purchase and the description cell carries the site slug. Filtering the
	 * row by slug and then matching the link by product name keeps the match
	 * unambiguous for an account holding several purchases on the same site.
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
	 * Starts cancellation from the purchase detail view and confirms it, leaving
	 * the page on the first step of the cancellation survey.
	 *
	 * The detail view lists the cancellation action under a "Cancel subscription"
	 * heading whose button is labelled simply "Cancel" — for plans and add-ons
	 * alike. Confirming lands on a screen whose primary button stays disabled
	 * until the acknowledgement checkbox is ticked.
	 */
	async cancelPurchase() {
		await this.page.getByRole( 'button', { name: 'Cancel', exact: true } ).click();

		// Matched on a copy-resilient fragment: the full label is the only checkbox
		// on the confirmation screen for a plan or add-on, and its curly apostrophes
		// are easy to mangle.
		await this.page.getByRole( 'checkbox', { name: /reviewed what/i } ).check();

		await this.page.getByRole( 'button', { name: 'Cancel subscription', exact: true } ).click();
	}
}
