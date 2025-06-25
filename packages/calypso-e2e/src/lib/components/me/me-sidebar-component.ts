import { Page } from 'playwright';
import envVariables from '../../../env-variables';

const selectors = {
	// Menu items
	menuItem: ( menu: string ) =>
		`.sidebar a:has(span:has-text("${ menu }")), .sidebar a[href="${ menu }"]`,
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
	 * Opens the menu on mobile.
	 */
	async openMobileMenu() {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.page.getByTitle( 'Menu' ).click();
		}
	}

	/**
	 * Given a string, navigate to the menu on the sidebar.
	 *
	 * @param {string} menu Menu item label or href to navigate to.
	 */
	async navigate( menu: string ): Promise< void > {
		await this.page.click( selectors.menuItem( menu ) );
	}
}
