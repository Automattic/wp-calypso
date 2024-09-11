import { Locator, Page } from 'playwright';

export type HelpCenterTestEnvironment = 'calypso' | 'editor';
export type ResultsCategory = 'Docs' | 'Links';

/**
 * Represents the Help Center popover.
 */
export class HelpCenterComponent {
	private page: Page;
	private popup: Locator;
	private environment: HelpCenterTestEnvironment;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {string} environment The environment in which the component is being used.
	 */
	constructor( page: Page, environment: HelpCenterTestEnvironment ) {
		this.page = page;
		this.environment = environment;
		this.popup =
			environment === 'editor'
				? this.page.frameLocator( '.calypsoify iframe' ).locator( '.help-center__container' )
				: this.page.locator( '.help-center__container' );
	}

	/**
	 * Get the help center container locator.
	 */
	getHelpCenterLocator(): Locator {
		return this.popup;
	}

	/**
	 * Opens the support popover from the closed state.
	 */
	async openPopover(): Promise< void > {
		let helpButton: Locator;

		if ( this.environment === 'calypso' ) {
			helpButton = this.page.locator( 'button.masterbar__item-help' );
		} else {
			helpButton = this.page.frameLocator( '.calypsoify iframe' ).locator( 'button.help-center' );
		}

		await helpButton.click();
		await this.popup.waitFor( { state: 'visible' } );
	}

	/**
	 * Closes the support popover from the open state.
	 */
	async closePopover(): Promise< void > {
		const closeButton = await this.popup.locator( '.help-center-header__close' );

		// The `isVisible` API is deprecated because it returns immediately,
		// so it is not recommended here.
		if ( ! ( await this.popup.count() ) ) {
			return;
		}

		await closeButton.click();
		await this.popup.waitFor( { state: 'detached' } );
	}

	/**
	 * Minimizes the support popover from the open state.
	 */
	async minimizePopover(): Promise< void > {
		const minimizeButton = await this.popup.locator( '.help-center-header__minimize' );

		await minimizeButton.click();
		await this.popup.locator( '.help-center__container-content' ).waitFor( { state: 'hidden' } );
	}

	/**
	 * Check the presence of the Help Center popover.
	 */
	async isPopoverShown(): Promise< boolean > {
		const isVisible = await this.popup.isVisible();
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
	 * Get the article content locator.
	 */
	getArticleContent(): Locator {
		return this.popup.getByRole( 'article' );
	}

	/**
	 * Start Support Flow
	 */
	async startSupportFlow(): Promise< void > {
		// Using dispatchEvent because the cookie banner sometimes blocks the button.
		await this.popup.getByRole( 'button', { name: 'Still need help?' } ).dispatchEvent( 'click' );
	}

	/**
	 * Start the AI chat.
	 *
	 * @param {string} query Search keyword to be entered into the message field.
	 */
	async startAIChat( query: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForResponse(
				( response ) =>
					response.url().includes( '/wpcom/v2/odie/chat/wpcom-support-chat' ) &&
					response.status() === 200
			),
			this.popup.getByPlaceholder( 'Ask your question' ).fill( query ),
			this.popup.locator( '.odie-send-message-inner-button' ).click(),
		] );
	}

	/**
	 * Get the Contact Support button.
	 */
	getContactSupportButton(): Locator {
		return this.popup.locator( '.odie-chatbox-message-last button' ).last();
	}
}
