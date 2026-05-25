import { Page } from 'playwright';
import envVariables from '../../../env-variables';

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
	 * @param {string} menu Menu item label (e.g. "Purchases") or the link's
	 *   href (e.g. "/me/account") to navigate to.
	 */
	async navigate( menu: string ): Promise< void > {
		// The sidebar link renders a `.sidebar__menu-link-text` span carrying a
		// `data-e2e-sidebar` attribute set to the exact menu label. Matching on
		// that attribute (exact match) and resolving the enclosing anchor is far
		// more robust than the previous substring `:has-text()` selector.
		//
		// Some callers pass an href (a path beginning with "/") instead of a
		// label, so also support an exact `href` attribute match — unlike the
		// previous `a[href="<label>"]` fallback, which compared the href to a
		// label string and therefore never matched a real link.
		const byLabel = this.page.locator( `.sidebar a:has([data-e2e-sidebar="${ menu }"])` );
		const byHref = this.page.locator( `.sidebar a[href="${ menu }"]` );
		const menuItem = byLabel.or( byHref ).first();

		await menuItem.waitFor( { state: 'visible' } );
		await menuItem.click();
	}
}
