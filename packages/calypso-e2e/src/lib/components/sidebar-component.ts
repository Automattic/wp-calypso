import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import envVariables from '../../env-variables';
import { NavbarComponent } from './navbar-component';

type FocusType = 'Sites' | 'Sidebar';

const selectors = {
	sidebar: '.sidebar',
	sidebarNoticeButton: ( name: string ) =>
		`.sidebar .current-site__notices button:text("${ name }")`,
	collapsedSidebar: '.is-sidebar-collapsed',
	focusedLayout: ( focus: FocusType ) => `.layout.focus-${ focus.toLowerCase() }`,

	// Buttons and links within Sidebar
	linkWithText: ( text: string ) => `a:has-text("${ text }")`,
	planName: ':text-is("Upgrades"):visible .sidebar__inline-text',
};

/**
 * Component representing the sidebar on the dashboard of WPCOM.
 *
 */
export class SidebarComponent {
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

		// If the sidebar is collapsed (via the Collapse Menu toggle),
		// re-expand the sidebar.
		if ( await this.sidebarIsCollapsed() ) {
			const sidebarCollapseToggle = this.page.locator( selectors.linkWithText( 'Collapse menu' ) );
			// Wait until the collapsed sidebar CSS is detached from DOM, ie. it is no longer collapsed.
			await Promise.all( [
				this.page.waitForSelector( selectors.collapsedSidebar, { state: 'detached' } ),
				sidebarCollapseToggle.dispatchEvent( 'click' ),
			] );
		}
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

		// Top level menu item selector.
		const itemSelector = `${ selectors.sidebar } :text-is("${ item }"):visible`;
		await this.page.dispatchEvent( itemSelector, 'click' );

		// Sub-level menu item selector.
		if ( subitem ) {
			const subitemSelector = `.is-toggle-open :text-is("${ subitem }"):visible`;
			await Promise.all( [
				this.page.waitForNavigation( { timeout: 30 * 1000 } ),
				this.page.dispatchEvent( subitemSelector, 'click' ),
			] );
		}

		const currentURL = this.page.url();
		// Do not verify selected menu items or retry if navigation takes user out of Calypso (eg. WP-Admin, Widgets editor)...
		if ( ! currentURL.startsWith( getCalypsoURL() ) ) {
			return;
		}
		// ... or to a page in Calypso that closes the sidebar.
		if ( currentURL.match( /\/(post|page|site-editor)\// ) ) {
			return;
		}

		// Some menu items (eg. Comments, Stats) do not have a submenu. In these cases,
		// the `.selected` class is applied to the top level menu.
		let selectedMenuItem = `${ selectors.sidebar } .selected :text-is("${ item }")`;

		if ( subitem ) {
			selectedMenuItem = `${ selectors.sidebar } .selected :text-is("${ subitem }")`;
		}

		// Verify the expected item or subitem is selected.
		const locator = this.page.locator( selectedMenuItem );
		await locator.waitFor( { state: 'attached' } );
	}

	/**
	 * Open a notice of the sidebar menu.
	 *
	 * @param {string} noticeButtonName Name of the notice button where the click will be performed.
	 * @param {string} expectedUrl Expected URL after clicking on the notice.
	 * @returns {Promise<void>} No return value.
	 */
	async openNotice( noticeButtonName: string, expectedUrl?: string ): Promise< void > {
		await this.waitForSidebarInitialization();

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.openMobileSidebar();
		}

		// Top level menu item selector.
		const itemSelector = selectors.sidebarNoticeButton( noticeButtonName );
		await this.page.dispatchEvent( itemSelector, 'click' );

		const currentURL = this.page.url();
		// Do not verify selected menu items or retry if navigation takes user out of Calypso (eg. WP-Admin, Widgets editor)...
		if ( ! currentURL.startsWith( getCalypsoURL() ) ) {
			return;
		}
		// ... or to a page in Calypso that closes the sidebar.
		if ( currentURL.match( /\/(post|page|site-editor)\// ) ) {
			return;
		}

		if ( expectedUrl ) {
			await this.page.waitForURL( expectedUrl );
		}
	}

	/* Miscellaneous actions on sidebar */

	/**
	 * Clicks on the switch site menu item in the sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async switchSite(): Promise< void > {
		await this.waitForSidebarInitialization();

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.openMobileSidebar();
		}

		await this.page.click( selectors.linkWithText( 'Switch Site' ) );
		await this.page.waitForSelector( selectors.focusedLayout( 'Sites' ) );
	}

	/**
	 * Clicks on the Add Site button at bottom of the site selector within the sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async addSite(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.linkWithText( 'Add New Site' ) ),
		] );
	}

	/**
	 * Returns the current plan name as shown on the sidebar.
	 *
	 * Note, the plan name shown in the sidebar may not always be
	 * accurate due to race conditions. Consider this method as
	 * secondary validation.
	 *
	 * Additionally, on mobile viewports if the current page is
	 * Upgrades > Plans the plan name is not visible in the sidebar.
	 * This method should be used after navigating away from the
	 * Plans page.
	 *
	 * @returns {Promise<string>} Name of the plan.
	 * @throws {Error} If the viewport is mobile and the currently displayed page is Upgrades > Plans.
	 */
	async getCurrentPlanName(): Promise< string > {
		await this.waitForSidebarInitialization();

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			if ( this.page.url().includes( getCalypsoURL( 'plans' ) ) ) {
				throw new Error(
					'Unable to retrieve current plan name on mobile sidebar.\nNavigate away from Upgrades > Plans page and try again.'
				);
			}

			await this.openMobileSidebar();
		}

		const planNameLocator = this.page.locator( selectors.planName );
		return await planNameLocator.innerText();
	}

	/* Viewport-specific methods */

	/**
	 * Determines whether the sidebar is in a collapsed state for desktop viewports.
	 *
	 * This check is part of the self-healing process for the sidebar-related end-to-end
	 * tests, as rest of the Sidebar methods rely on the sidebar in a non-collapsed
	 * state.
	 */
	private async sidebarIsCollapsed(): Promise< boolean > {
		const collapsedSidebarLocator = this.page.locator( selectors.collapsedSidebar );
		return ( await collapsedSidebarLocator.count() ) > 0;
	}

	/**
	 * Opens the mobile variant of the sidebar into view.
	 *
	 * For mobile sized viewports, the sidebar is by default hidden off screen.
	 * In order to interact with the sidebar, My Sites button on top left must first
	 * be clicked to bring the mobile sidebar into view.
	 */
	private async openMobileSidebar(): Promise< void > {
		await this.waitForSidebarInitialization();

		const navbarComponent = new NavbarComponent( this.page );
		await navbarComponent.clickMobileMenu();

		// `focus-sidebar` attribute is added to the main layout screen.
		const layoutElement = await this.page.waitForSelector( selectors.focusedLayout( 'Sidebar' ) );
		await layoutElement.waitForElementState( 'stable' );
	}
}
