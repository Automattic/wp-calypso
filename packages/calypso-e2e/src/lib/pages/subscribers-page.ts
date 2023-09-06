import { Locator, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

type NewSubscribersList = readonly [ string, string?, string? ];

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
		// First open the hamburger menu of the row containing the subscriber
		// to remove.
		await this.anchor
			.getByRole( 'row' )
			.filter( { hasText: identifier } )
			.getByRole( 'button', { name: 'Open subscriber menu' } )
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

	/**
	 * Adds subscribers from the Subscribers listing page.
	 *
	 * @param {NewSubscribersList} subscribers List of emails to add, up to 3.
	 */
	async addSubscribers( subscribers: NewSubscribersList ) {
		// Click on the 'Add Subscriber' primary button.
		await this.anchor.getByRole( 'button', { name: 'Add subscribers' } ).click();

		// Wait for the dialog box.
		const dialog = this.page.getByRole( 'dialog', { name: /Add subscribers/ } );
		await dialog.waitFor();

		const inputLocators = await dialog.getByRole( 'textbox' ).all();

		// Map each input box (up to 3) to the list of emails to add.
		// Note, the resulting mapping array will be the same length as the
		// length of `subscribers` input.
		const mapping: [ string, Locator ][] = subscribers.map( function ( subscriber, index ) {
			return [ subscriber as string, inputLocators[ index ] ];
		} );

		// Fill in email detail for each input.
		for ( const [ subscriber, locator ] of mapping ) {
			await locator.fill( subscriber );
		}

		await dialog.getByRole( 'button', { name: 'Add subscribers' } ).click();
	}
}
