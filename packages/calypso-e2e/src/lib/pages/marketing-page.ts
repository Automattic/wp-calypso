import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { clickNavTab } from '../../element-helper';

type MarketingPageTab =
	| 'Marketing Tools'
	| 'Traffic'
	| 'Connections'
	| 'Sharing Buttons'
	| 'Business Tools';
type SEOPageTitleStructureCategories = 'Front Page' | 'Posts' | 'Pages' | 'Tags' | 'Archives';
type SEOExternalServices = 'Google search' | 'Facebook' | 'Twitter';
type SocialConnection = 'Facebook' | 'LinkedIn' | 'Tumblr' | 'Mastodon' | 'Instagram Business';

const selectors = {
	pageTitleStructureInput: '.title-format-editor',
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

	/* Generic methods */

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

	/**
	 * Given an accessible name of the button, click on the button.
	 *
	 * @param {string} name Accessible name of the button.
	 */
	async clickButton( name: string ) {
		await this.page.getByRole( 'button', { name: name } ).click();
	}

	/* SEO Preview Methods */

	/**
	 *
	 */
	async saveSettings() {
		await this.page.getByRole( 'button', { name: 'Save' } ).first().click();

		await this.page.waitForResponse( /settings/ );
	}

	/**
	 * Enters text into the Website Meta Information field.
	 *
	 * @param {string} text String to be used as the description of the web site in SEO.
	 */
	async enterExternalPreviewText( text: string ) {
		await this.page.getByRole( 'textbox', { name: 'Front Page Meta Description' } ).fill( text );
	}

	/**
	 * Validates the external preview for the specified service contains the text.
	 *
	 * @param {SEOExternalServices} service External service.
	 * @param {string} text Text to validate.
	 */
	async validateExternalPreview( service: SEOExternalServices, text: string ) {
		await this.page.locator( '.vertical-menu__social-item' ).filter( { hasText: service } ).click();

		await this.page.locator( '.seo-preview-pane__preview' ).getByText( text ).waitFor();
	}

	/**
	 * Enters the specified text into the input of the specified category, changing the
	 * page title structure.
	 *
	 * @param {SEOPageTitleStructureCategories} category Category to modify.
	 * @param {string} text Text to enter.
	 */
	async enterPageTitleStructure( category: SEOPageTitleStructureCategories, text: string ) {
		const target = this.page
			.locator( selectors.pageTitleStructureInput )
			.filter( { has: this.page.getByText( category ) } )
			.getByRole( 'textbox' );

		await target.scrollIntoViewIfNeeded();

		await target.fill( text );
	}

	/**
	 * Returns the preview text for the page title structure category.
	 *
	 * @param {string} text Text to validate.
	 */
	async validatePreviewTextForPageStructureCategory( text: string ) {
		await this.page
			.locator( '.title-format-editor__preview' )
			.filter( { hasText: text } )
			.waitFor();
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
