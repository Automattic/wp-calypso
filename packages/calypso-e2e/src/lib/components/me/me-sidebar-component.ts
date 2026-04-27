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
			// Wait for the masterbar to finish re-rendering after page navigation
			// before clicking, otherwise the element can be detached mid-click.
			await this.page.waitForLoadState( 'networkidle' );
			await this.page.getByTitle( 'Menu' ).click();
		}
	}

	/**
	 * Given a string, navigate to the menu on the sidebar.
	 *
	 * @param {string} menu Menu item label or href to navigate to.
	 */
	async navigate( menu: string ): Promise< void > {
		// The /me sidebar can re-render shortly after page load while
		// account/site state hydrates. Clicking before the sidebar has
		// settled causes the link to be detached mid-click, so wait for
		// the sidebar to be present and the page to be idle first, then
		// click via a Locator (which re-resolves on retry, unlike
		// page.click which can keep timing out against a detached node).
		await this.page.waitForLoadState( 'networkidle' );
		await this.page.locator( '.sidebar' ).first().waitFor();
		const menuItem = this.page.locator( selectors.menuItem( menu ) ).first();
		await menuItem.waitFor();
		await menuItem.click();
	}
}
