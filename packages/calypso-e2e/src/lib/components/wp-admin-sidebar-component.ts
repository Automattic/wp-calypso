import { Page } from 'playwright';

const selectors = {
	sidebar: '#adminmenu',
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

		const menuItem = this.page.locator( selectors.sidebar ).getByRole( 'link', { name: item } );

		if ( subitem ) {
			await menuItem.hover();
			await this.page.locator( selectors.sidebar ).getByRole( 'link', { name: subitem } ).click();
		} else {
			await menuItem.click();
		}
	}
}
