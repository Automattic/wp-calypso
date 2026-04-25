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
	 * Retries with page reloads because subscription confirmation
	 * can take longer than the initial page load.
	 *
	 * @param {string} identifier Identifier to locate the subscriber by.
	 */
	async validateSubscriber( identifier: string ) {
		const locator = this.anchor.getByRole( 'cell' ).filter( { hasText: identifier } );
		const maxRetries = 3;

		for ( let i = 0; i < maxRetries; i++ ) {
			try {
				await locator.waitFor( { timeout: 10 * 1000 } );
				return;
			} catch {
				if ( i === maxRetries - 1 ) {
					throw new Error( `Subscriber ${ identifier } not found after ${ maxRetries } attempts.` );
				}
				// We need to reload to refresh API query.
				await this.page.reload();
			}
		}
	}

	/**
	 * Given a subscriber identifier, removes the subscriber.
	 *
	 * @param {string} identifier Identifier to locate and remove.
	 */
	async removeSubscriber( identifier: string ) {
		// First open the hamburger menu of the row containing the subscriber
		// to remove.
		await this.anchor
			.getByRole( 'row' )
			.filter( { hasText: identifier } )
			.getByRole( 'button', { name: 'Actions' } )
			.click();

		// Click on the remove menu item.
		await this.page.getByRole( 'menuitem', { name: 'Remove' } ).click();

		// Confirm.
		await this.page
			.getByRole( 'dialog' )
			.getByRole( 'button', { name: 'Remove subscriber' } )
			.click();

		// Ensure the subscriber is no longer present.
		await this.anchor
			.getByRole( 'row' )
			.filter( { hasText: identifier } )
			.waitFor( { state: 'detached' } );
	}
}
