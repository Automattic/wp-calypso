import { Page } from 'playwright';
import envVariables from '../../../env-variables';

const selectors = {
	sidebar: '.sidebar',
	// Menu items. Prefer an exact text match on the inner span to avoid
	// matching unrelated items, and keep the legacy href clause as a
	// fallback for callers that pass an href value instead of a label.
	menuItem: ( menu: string ) =>
		`.sidebar a:has(span:text-is("${ menu }")), .sidebar a[href="${ menu }"]`,
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
	 * Waits for the Me sidebar to be ready on the page.
	 *
	 * The /me endpoint hydrates client-side after navigation, which can
	 * cause the sidebar links to detach and re-attach mid-click. Waiting
	 * for the page to be loaded and the sidebar root to be visible avoids
	 * racing the React re-render.
	 */
	private async waitForSidebarInitialization(): Promise< void > {
		await Promise.all( [
			this.page.waitForLoadState( 'load', { timeout: 20 * 1000 } ),
			this.page.locator( selectors.sidebar ).waitFor( { timeout: 20 * 1000 } ),
		] );
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
		await this.waitForSidebarInitialization();

		// Resolve the menu link as a Locator and wait for it to be visible
		// before reading its href. This avoids the "element was detached
		// from the DOM, retrying" race where the sidebar re-renders right
		// after the element is first resolved.
		const menuItem = this.page.locator( selectors.menuItem( menu ) ).first();
		await menuItem.waitFor( { state: 'visible', timeout: 20 * 1000 } );
		const href = await menuItem.getAttribute( 'href' );

		// Use dispatchEvent to bypass the actionability re-check that was
		// failing when the link detached mid-click during sidebar hydration.
		await menuItem.dispatchEvent( 'click' );

		// Confirm the client-side navigation actually completed before the
		// caller proceeds; otherwise subsequent assertions can run against
		// the previous page.
		if ( href ) {
			await this.page.waitForURL( `**${ href }`, { waitUntil: 'domcontentloaded' } );
		}
	}
}
