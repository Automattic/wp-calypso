import { Page } from 'playwright';

const selectors = {
	// Menu items
	menuItem: ( menu: string ) =>
		`.sidebar a:has(span:has-text("${ menu }")), .sidebar a[href="${ menu }"]`,

	// Buttons
	logoutButton: 'button[title="Log out of WordPress.com"]',
};

/**
 * Represents the sidebar component on /me endpoint.
 */
export class MeSidebarComponent {
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
	 * Given a string, navigate to the menu on the sidebar.
	 *
	 * @param {string} menu Menu item label or href to navigate to.
	 */
	async navigate( menu: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.menuItem( menu ) ),
		] );
	}

	/**
	 * Clicks on the log out button and waits for the navigation
	 * to complete.
	 */
	async clickLogout(): Promise< void > {
		const locator = this.page.locator( selectors.logoutButton );
		await Promise.all( [ this.page.waitForNavigation(), locator.click() ] );
	}
}
