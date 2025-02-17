import { Locator, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

/**
 * Represents the Users > Subscribers page.
 */
export class SubscribersPage {
	private page: Page;
	private anchor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page
	 */
	constructor( page: Page ) {
		this.page = page;
		this.anchor = this.page.getByRole( 'main' );
	}

	/**
	 * Visits the page.
	 *
	 * @param {string} siteSlug Site slug.
	 */
	async visit( siteSlug: string ) {
		await this.page.goto( getCalypsoURL( `subscribers/${ siteSlug }` ) );
	}

	/**
	 * Validate that supplied `text` matches at least one subscriber.
	 *
	 * @param {string} identifier Identifier to locate the subscriber by.
	 */
	async validateSubscriber( identifier: string ) {
		await this.anchor.getByRole( 'cell' ).filter( { hasText: identifier } ).waitFor();
	}

	/**
	 * Given a subscriber identifier, removes the subscriber.
	 *
	 * @param {string} identifier Identifier to locate and remove.
	 */
	async removeSubscriber( identifier: string ) {
		// First find the row containing the subscriber
		const row = this.anchor.getByRole( 'row' ).filter( { hasText: identifier } );

		// Wait for the row to be visible
		await row.waitFor( { state: 'visible' } );

		// Find and click the actions button within that row
		await row.locator( 'button.dataviews-all-actions-button[aria-label="Actions"]' ).click();

		// Click on the remove menu item.
		await this.page.getByRole( 'menuitem', { name: 'Remove' } ).click();

		// Confirm.
		await this.page
			.getByRole( 'dialog' )
			.getByRole( 'button', { name: 'Remove subscriber' } )
			.click();

		// Ensure the subscriber is no longer present.
		await row.waitFor( { state: 'detached', timeout: 5000 } );
	}
}
