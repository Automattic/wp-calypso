import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { clickNavTab } from '../../element-helper';

type MarketingPageTab =
	| 'Marketing Tools'
	| 'Traffic'
	| 'Connections'
	| 'Sharing Buttons'
	| 'Business Tools';
type SocialConnection = 'Facebook' | 'LinkedIn' | 'Tumblr' | 'Mastodon' | 'Instagram Business';

const selectors = {
	// Traffic tab
	websiteMetaTextArea: '#advanced_seo_front_page_description',
	seoPreviewButton: '.seo-settings__preview-button',
	seoPreviewPane: '.web-preview.is-seo',
	seoPreviewPaneCloseButton: '.web-preview__close',
};

/**
 * Page representing the Tools > Marketing page.
 */
export class MarketingPage {
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
	 * Navigates directly to the Marketing page for the site.
	 *
	 * @param {string} siteSlug Site slug.
	 */
	async visit( siteSlug: string ) {
		await this.page.goto( getCalypsoURL( `marketing/tools/${ siteSlug }` ) );
	}

	/**
	 * Click on the tab name matching the given parameter `name`.
	 *
	 * @param {MarketingPageTab} name Name of the tab to click on the top of the page.
	 */
	async clickTab( name: MarketingPageTab ) {
		await clickNavTab( this.page, name );
	}

	/* SEO Preview Methods */

	/**
	 * Enters text into the Website Meta Information field.
	 *
	 * @param {string} [text] String to be used as the description of the web site in SEO.
	 * @returns {Promise<void>} No return value.
	 */
	async enterWebsiteMetaInformation( text = 'test text' ): Promise< void > {
		await this.page.fill( selectors.websiteMetaTextArea, text );
	}

	/**
	 * Open the preview of SEO changes.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openSEOPreview(): Promise< void > {
		const locator = this.page.locator( selectors.seoPreviewButton );
		await locator.click();
		await this.page.waitForSelector( selectors.seoPreviewPane );
	}

	/**
	 * Close the preview of SEO changes.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closeSEOPreview(): Promise< void > {
		await this.page.click( selectors.seoPreviewPaneCloseButton );
		await this.page.waitForSelector( selectors.seoPreviewButton );
	}

	/* Social Connectisons */

	/**
	 * Clicks on the Connection button for specified Social service.
	 *
	 * @param {SocialConnection} target Social service.
	 */
	async clickSocialConnectButton( target: SocialConnection ): Promise< Page > {
		// Set up a handler for the popup promise.
		const popupPromise = this.page.waitForEvent( 'popup' );

		await this.page
			.getByRole( 'main' )
			.getByRole( 'listitem' )
			.filter( { hasText: target } )
			.getByRole( 'button', { name: 'Connect' } )
			.click();

		return await popupPromise;
	}

	/**
	 * Validates the specified Social service button now is connected.
	 *
	 * @param {SocialConnection} target Social service.
	 * @throws {Error} If the social connection was not made for any reason.
	 */
	async validateSocialConnected( target: SocialConnection ): Promise< void > {
		await this.page
			.getByRole( 'main' )
			.getByRole( 'listitem' )
			.filter( { hasText: target } )
			.getByRole( 'button', { name: 'Disconnect' } )
			.waitFor();
	}

	/**
	 * Tailored method to set up the Tumblr connection.
	 *
	 * @param {Page} popup Pointer to the popup Page object.
	 * @param param1 Keyed object parameter.
	 * @param {string} param1.username Tumblr username.
	 * @param {string} param1.password Tumblr password.
	 */
	async setupTumblr( popup: Page, { username, password }: { username: string; password: string } ) {
		// Wait for the page load to complete. Otherwise, a `Cannot POST /login` error
		// is shown.
		await popup.waitForLoadState( 'networkidle' );

		// Fill in the email and password.
		await popup.getByRole( 'textbox', { name: 'email' } ).fill( username );
		await popup.getByPlaceholder( 'Password' ).fill( password );

		// Log in.
		await popup.getByRole( 'button', { name: 'Log in' } ).click();

		// Click on Tumblr side's "Allow" button.
		const popupClosePromise = popup.waitForEvent( 'close' );
		await popup.getByRole( 'button', { name: 'Allow' } ).click();
		await popupClosePromise;

		// Click on the Calypso side's "Connect" button.
		await this.page.getByRole( 'dialog' ).getByRole( 'button', { name: 'Connect' } ).click();
	}
}
