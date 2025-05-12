import { Page } from 'playwright';
import envVariables from '../../env-variables';

const selectors = {
	sidebarToggle: ( page: Page ) => page.getByRole( 'menuitem', { name: 'Menu' } ),
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
		const sidebarOrSidebarToggle =
			envVariables.VIEWPORT_NAME === 'mobile'
				? selectors.sidebarToggle( this.page )
				: this.page.locator( selectors.sidebar );

		await Promise.all( [
			this.page.waitForLoadState( 'load', { timeout: 20 * 1000 } ),
			sidebarOrSidebarToggle.waitFor( { timeout: 20 * 1000 } ),
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

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.openMobileSidebar();
		}

		const menuItem = this.page.locator( selectors.sidebar ).getByRole( 'link', { name: item } );

		if ( subitem ) {
			if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
				await menuItem.click();
			} else {
				await menuItem.hover();
			}

			await this.page.locator( selectors.sidebar ).getByRole( 'link', { name: subitem } ).click();
		} else {
			await menuItem.click();
		}
	}

	/**
	 * Opens the mobile variant of the sidebar into view.
	 *
	 * For mobile sized viewports, the sidebar is by default hidden off screen.
	 * In order to interact with the sidebar, the hamburger menu button on top left must first
	 * be clicked to bring the mobile sidebar into view.
	 */
	private async openMobileSidebar(): Promise< void > {
		await selectors.sidebarToggle( this.page ).click();

		await this.page.waitForSelector( selectors.sidebar );
	}
}
