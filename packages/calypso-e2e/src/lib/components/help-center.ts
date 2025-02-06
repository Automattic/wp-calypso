import { ZENDESK_STAGING_SUPPORT_CHAT_KEY } from '@automattic/zendesk-client/src/constants';
import { Locator, Page } from 'playwright';

export type ResultsCategory = 'Docs' | 'Links';

declare const configData: Record< string, unknown >;

/**
 * Represents the Help Center popover.
 */
export class HelpCenterComponent {
	private page: Page;
	private popup: Locator;
	private isWpAdmin: boolean;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.popup = this.page.locator( '.help-center__container' );
		this.isWpAdmin = page.url().includes( 'wp-admin' );
	}

	/**
	 * Get the help center container locator.
	 *
	 * @returns {Locator} The help center container locator.
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
	 *
	 * @returns {Promise<void>}
	 */
	async openPopover(): Promise< void > {
		// Return if its already open.
		if ( await this.isVisible() ) {
			return;
		}

		if ( this.isWpAdmin ) {
			await this.page.locator( '#wp-admin-bar-help-center' ).click();
		} else {
			await this.page.getByRole( 'button', { name: 'Help', exact: true } ).click();
		}

		await this.popup.locator( '.placeholder-lines__help-center' ).waitFor( { state: 'detached' } );
		await this.popup.waitFor( { state: 'visible' } );
	}

	/**
	 * Closes the support popover from the open state.
	 *
	 * @returns {Promise<void>}
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
	 *
	 * @returns {Promise<void>}
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
	 * Maximizes the support popover.
	 *
	 * @returns {Promise<void>}
	 */
	async maximizePopover(): Promise< void > {
		const maximizeButton = await this.popup.getByRole( 'button', {
			name: 'Maximize Help Center',
			exact: true,
		} );

		await maximizeButton.click();
		await this.popup.locator( '.help-center__container-content' ).waitFor( { state: 'visible' } );
	}

	/**
	 * Go back to the previous page.
	 */
	async goBack(): Promise< void > {
		await this.popup.getByTestId( 'help-center-back-button' ).click();
	}

	/**
	 * Check the presence of the Help Center popover.
	 *
	 * @returns {boolean} Whether the popover is shown.
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
	 *
	 * @returns {Locator} The articles locator.
	 */
	getArticles(): Locator {
		return this.popup
			.getByRole( 'list', { name: 'Recommended Resources' } )
			.getByRole( 'listitem' );
	}

	/**
	 * Get Odie chat
	 *
	 * @returns {Locator} The Odie chat locator.
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
					response.url().includes( '/odie/chat/wpcom-support-chat' ) && response.status() === 200
			),
			sendMessageForm
				.locator( 'textarea' )
				.fill( query )
				// Programmatically trigger the form submission to avoid issues with the cookie banner.
				.then( () => sendMessageForm.dispatchEvent( 'submit' ) ),
		] );
	}

	/**
	 * Set Zendesk to staging environment.
	 *
	 * @returns {Promise<void>}
	 */
	async setZendeskStaging(): Promise< void > {
		// Rewrite the authentication request to avoid calling Zendesk API in test environment.
		await this.page.route( '**/authenticate/chat?*', ( route, request ) => {
			const url = new URL( request.url() );

			if ( url.searchParams.get( 'type' ) === 'zendesk' ) {
				url.searchParams.set( 'test_mode', 'true' );
			}

			route.continue( { url: url.toString() } );
		} );

		await this.page.evaluate(
			( _constants ) => {
				if ( typeof configData !== 'undefined' ) {
					configData.zendesk_support_chat_key = _constants.ZENDESK_STAGING_SUPPORT_CHAT_KEY;
				}
			},
			{
				ZENDESK_STAGING_SUPPORT_CHAT_KEY,
			}
		);
	}

	/**
	 * Set Odie to Test mode.
	 *
	 * @returns {Promise<void>}
	 */
	async setOdieTestMode(): Promise< void > {
		// Rewrite the Odie POST request to make sure it's in test mode.
		await this.page.route( '**/odie/chat/*', async ( route, request ) => {
			const postBody = JSON.parse( request.postData() || '{}' );

			// Add Test Mode to the request.
			postBody.test = true;

			// Continue with the modified post data
			await route.continue( {
				postData: JSON.stringify( postBody ),
				headers: {
					...request.headers(),
					'Content-Type': 'application/json',
				},
			} );
		} );
	}

	/**
	 * Get the Contact Support button.
	 *
	 * @returns {Locator} The Contact Support button locator.
	 */
	getContactSupportButton(): Locator {
		return this.popup.getByRole( 'button', { name: 'Contact WordPress.com Support' } ).last();
	}
}
