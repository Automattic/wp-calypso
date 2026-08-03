import { Page } from 'playwright';
import envVariables from '../../../env-variables';

/**
 * Represents the `/me` sidebar in the Multi-site Dashboard.
 */
export class DashboardMeSidebarComponent {
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
	 * Brings the sidebar into view on mobile viewports.
	 *
	 * Below the `medium` breakpoint the sidebar is rendered off screen behind
	 * `ResponsiveSidebar` and only slides in once the omnibar's menu toggle is
	 * clicked. No-op on wider viewports, where the sidebar is always visible.
	 */
	async openMobileMenu() {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			return;
		}

		// The toggle is an icon-only button whose accessible name is empty (the
		// icon is a CSS pseudo-element and it carries no aria-label), so matching
		// by role and name never resolves it. Match its `title` instead.
		const menuToggle = this.page.getByTitle( 'Menu' ).first();
		// The overlay is portalled into place only while the sidebar is open, so
		// its presence is a reliable "sidebar is open" signal.
		const openSidebar = this.page.getByTestId( 'dashboard-responsive-sidebar-overlay' );

		await menuToggle.waitFor( { state: 'visible' } );

		// The toggle lives in the omnibar, which hydrates in a React root separate
		// from — and asynchronously after — the main app. Its server-rendered
		// markup is clickable before the click handler is wired, so an early click
		// is a silent no-op. Retry until the sidebar actually slides open.
		for ( let attempt = 0; attempt < 15; attempt++ ) {
			await menuToggle.click();
			try {
				await openSidebar.waitFor( { state: 'visible', timeout: 1000 } );
				return;
			} catch {
				// Sidebar still closed — the omnibar likely has not hydrated yet.
			}
		}

		throw new Error( 'Mobile sidebar did not open after clicking the Menu toggle.' );
	}

	/**
	 * Navigates to the given item of the sidebar menu.
	 *
	 * @param item Plaintext label of the menu item (eg. "Billing").
	 */
	async navigate(
		item: 'Account' | 'Preferences' | 'Billing' | 'Security' | 'Notifications' | 'Apps'
	) {
		await this.page
			.getByRole( 'navigation' )
			.getByRole( 'link', { name: item, exact: true } )
			.click();
	}
}
