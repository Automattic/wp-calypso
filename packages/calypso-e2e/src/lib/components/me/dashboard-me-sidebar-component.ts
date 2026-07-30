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
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.page.getByRole( 'button', { name: 'Menu' } ).click();
		}
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
