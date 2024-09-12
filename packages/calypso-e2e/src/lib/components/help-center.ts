import { Locator, Page } from 'playwright';

export type ResultsCategory = 'Docs' | 'Links';

/**
 * Represents the Help Center popover.
 */
export class HelpCenterComponent {
	private page: Page;
	private popup: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.popup = this.page.locator( '.help-center__container' );
	}

	/**
	 * Get the help center container locator.
	 */
	getHelpCenterLocator(): Locator {
		return this.popup;
	}

	/**
	 * Check if the help center is loaded.
	 */
	async isVisible(): Promise< boolean > {
		return Boolean( await this.popup.count() );
	}

	/**
	 * Opens the support popover from the closed state.
	 */
	async openPopover(): Promise< void > {
		// Return if its already open.
		if ( await this.isVisible() ) {
			return;
		}

		await this.page.getByRole( 'button', { name: 'Help', exact: true } ).click();
		await this.popup.waitFor( { state: 'visible' } );
	}

	/**
	 * Closes the support popover from the open state.
	 */
	async closePopover(): Promise< void > {
		// Return if its already closed.
		if ( ! ( await this.isVisible() ) ) {
			return;
		}

		const closeButton = await this.popup.getByRole( 'button', {
			name: 'Close Help Center',
			exact: true,
		} );
		await closeButton.click();
		await this.popup.waitFor( { state: 'detached' } );
	}

	/**
	 * Minimizes the support popover from the open state.
	 */
	async minimizePopover(): Promise< void > {
		const minimizeButton = await this.popup.getByRole( 'button', {
			name: 'Minimize Help Center',
			exact: true,
		} );

		await minimizeButton.click();
		await this.popup.locator( '.help-center__container-content' ).waitFor( { state: 'hidden' } );
	}

	/**
	 * Go back to the previous page.
	 */
	async goBack(): Promise< void > {
		await this.popup.locator( 'button.back-button__help-center' ).click();
	}

	/**
	 * Check the presence of the Help Center popover.
	 */
	async isPopoverShown(): Promise< boolean > {
		const isVisible = await this.isVisible();
		const popupBoundingBox = await this.popup.boundingBox();
		const viewport = await this.page.viewportSize();

		const isShowing =
			isVisible &&
			popupBoundingBox &&
			viewport &&
			popupBoundingBox?.x >= 0 &&
			popupBoundingBox?.y >= 0 &&
			popupBoundingBox?.x + popupBoundingBox?.width <= viewport?.width &&
			popupBoundingBox?.y + popupBoundingBox?.height <= viewport?.height;

		return Boolean( isShowing );
	}

	/**
	 * Get the articles locator.
	 */
	getArticles(): Locator {
		return this.popup
			.getByRole( 'list', { name: 'Recommended Resources' } )
			.getByRole( 'listitem' );
	}

	/**
	 * Get Odie chat
	 */
	getOdieChat(): Locator {
		return this.popup.locator( '#odie-messages-container' );
	}

	/**
	 * Fills the support popover search input and waits for the query to complete.
	 *
	 * @param {string} query Search keyword to be entered into the search field.
	 */
	async search( query: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForResponse(
				( response ) => {
					return (
						response.request().url().includes( '/help/search/wpcom' ) &&
						response
							.request()
							.url()
							.includes( `query=${ encodeURIComponent( query ) }` )
					);
				},
				{ timeout: 15 * 1000 }
			),
			this.popup.getByPlaceholder( 'Search for help' ).fill( query ),
		] );

		await this.popup.locator( '.placeholder-lines__help-center' ).waitFor( { state: 'detached' } );
	}

	/**
	 * Start the AI chat.
	 *
	 * @param {string} query Search keyword to be entered into the message field.
	 */
	async startAIChat( query: string ): Promise< void > {
		const sendMessageForm = this.popup.locator( '.odie-send-message-input-container' );

		await Promise.all( [
			this.page.waitForResponse(
				( response ) =>
					response.url().includes( '/wpcom/v2/odie/chat/wpcom-support-chat' ) &&
					response.status() === 200
			),
			sendMessageForm.locator( 'textarea' ).fill( query ),
			// Programmatically trigger the form submission to avoid issues with the cookie banner.
			sendMessageForm.dispatchEvent( 'submit' ),
		] );
	}

	/**
	 * Get the Contact Support button.
	 */
	getContactSupportButton(): Locator {
		return this.popup.getByRole( 'button', { name: 'Contact WordPress.com Support' } ).last();
	}
}
