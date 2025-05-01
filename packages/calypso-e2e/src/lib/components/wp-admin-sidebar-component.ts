import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	sidebar: '#adminmenu',

	// Buttons and links within Sidebar
	linkWithText: ( text: string ) => `a:has-text("${ text }")`,
};

/**
 * Component representing the sidebar in WP Admin.
 *
 */
export class WPAdminSidebarComponent {
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
	 * Waits for the WordPress.com Calypso sidebar to be ready on the page.
	 */
	async waitForSidebarInitialization(): Promise< void > {
		const sidebarLocator = this.page.locator( selectors.sidebar );

		await Promise.all( [
			this.page.waitForLoadState( 'load', { timeout: 20 * 1000 } ),
			sidebarLocator.waitFor( { timeout: 20 * 1000 } ),
		] );
	}

	/* Main sidebar action */

	/**
	 * Navigates to given (sub)item of the sidebar menu.
	 *
	 * @param {string} item Plaintext representation of the top level heading.
	 * @param {string} subitem Plaintext representation of the child level heading.
	 * @returns {Promise<void>} No return value.
	 */
	async navigate( item: string, subitem?: string ): Promise< void > {
		await this.waitForSidebarInitialization();

		// Top level menu item selector.
		const itemSelector = `${ selectors.sidebar } :text-is("${ item }"):visible`;
		await this.page.dispatchEvent( itemSelector, 'click' );

		// Sub-level menu item selector.
		if ( subitem ) {
			const subitemSelector = `.is-toggle-open :text-is("${ subitem }"):visible`;
			await Promise.all( [
				this.page.waitForNavigation( { timeout: 30 * 1000 } ),
				this.page.dispatchEvent( subitemSelector, 'click' ),
			] );
		}

		const currentURL = this.page.url();
		// Do not verify selected menu items or retry if navigation takes user out of Calypso (eg. WP-Admin, Widgets editor)...
		if ( ! currentURL.startsWith( getCalypsoURL() ) ) {
			return;
		}
		// ... or to a page in Calypso that closes the sidebar.
		if ( currentURL.match( /\/(post|page|site-editor)\// ) ) {
			return;
		}

		// Some menu items (eg. Comments, Stats) do not have a submenu. In these cases,
		// the `.selected` class is applied to the top level menu.
		let selectedMenuItem = `${ selectors.sidebar } .selected :text-is("${ item }")`;

		if ( subitem ) {
			selectedMenuItem = `${ selectors.sidebar } .selected :text-is("${ subitem }")`;
		}

		// Verify the expected item or subitem is selected.
		const locator = this.page.locator( selectedMenuItem );
		await locator.waitFor( { state: 'attached' } );
	}
}
