import { Page } from 'playwright';
import envVariables from '../../../env-variables';

const selectors = {
	sidebar: '.sidebar',
	// Menu items: prefer the visible label inside the sidebar. We match the
	// anchor that contains a span whose text equals the provided label (text-is
	// is exact-match, which avoids accidentally matching longer labels that
	// happen to include the needle substring).
	menuItem: ( menu: string ) => `.sidebar a:has(span:text-is("${ menu }"))`,
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
	 * The /me sidebar is re-rendered by React when the profile page finishes
	 * hydrating and when data-dependent subtrees (notification counts, etc.)
	 * resolve. A plain `page.click()` waits for the element to be visible,
	 * enabled and stable, which races against those re-renders and regularly
	 * produces "element was detached from the DOM, retrying" errors that
	 * exhaust the default 10s action timeout.
	 *
	 * To avoid that race, we resolve the target anchor's href first, dispatch
	 * the click directly on the DOM node (bypassing actionability checks that
	 * are the source of the detachment race), and then wait for the resulting
	 * URL to confirm the navigation actually happened. This mirrors the
	 * pattern used by the main Calypso SidebarComponent.
	 *
	 * @param {string} menu Menu item label to navigate to (e.g. "Purchases").
	 */
	async navigate( menu: string ): Promise< void > {
		// Make sure the sidebar itself is present before trying to resolve a
		// link inside it. This guards against the case where the /me page has
		// not finished its initial render yet.
		const sidebar = this.page.locator( selectors.sidebar );
		await sidebar.waitFor( { state: 'visible' } );

		const menuItem = this.page.locator( selectors.menuItem( menu ) ).first();
		await menuItem.waitFor( { state: 'attached' } );

		// Capture the href before clicking so we can wait for the navigation
		// deterministically even if the anchor re-mounts during the click.
		const href = await menuItem.getAttribute( 'href' );

		await menuItem.dispatchEvent( 'click' );

		if ( href ) {
			await this.page.waitForURL( `**${ href }`, { waitUntil: 'domcontentloaded' } );
		}
	}
}
