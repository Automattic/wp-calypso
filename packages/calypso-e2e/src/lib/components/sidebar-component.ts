import { Page } from 'playwright';
import { getCalypsoURL, toCalypsoURL } from '../../data-helper';
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

	// wp-admin menu, shown instead of the sidebar on sites using the Classic interface.
	wpAdminMenu: '#adminmenu',
	wpAdminMenuToggle: '#wp-admin-bar-menu-toggle a',
	wpAdminMenuOpen: '#wpwrap.wp-responsive-open',
	wpAdminMenuItem: ( item: string ) =>
		`#adminmenu > li:has(> a .wp-menu-name:text-is("${ item }"))`,
	wpAdminSubmenuLink: ( subitem: string ) => `.wp-submenu a:text-is("${ subitem }")`,
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
		const sidebarLocator = this.page.locator( `${ selectors.sidebar }, .global-sidebar` ).first();

		await Promise.all( [
			this.page.waitForLoadState( 'load', { timeout: 30 * 1000 } ),
			sidebarLocator.waitFor( { timeout: 30 * 1000 } ),
		] );

		// If the sidebar is collapsed (via the Collapse Menu toggle),
		// re-expand the sidebar.
		if ( await this.sidebarIsCollapsed() ) {
			const sidebarCollapseToggle = this.page.locator( selectors.linkWithText( 'Collapse menu' ) );
			// Wait until the collapsed sidebar CSS is detached from DOM, ie. it is no longer collapsed.
			await sidebarCollapseToggle.click();
			await this.page.locator( selectors.collapsedSidebar ).waitFor( { state: 'detached' } );
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
		// Sites on the Classic interface land in wp-admin, which has its own menu.
		if ( this.page.url().includes( '/wp-admin/' ) ) {
			return await this.navigateWpAdmin( item, subitem );
		}

		await this.waitForSidebarInitialization();

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.openMobileSidebar();
		}

		// Top level menu item selector.
		const itemSelector = `${ selectors.sidebar } a:has(:text-is("${ item }"):visible)`;

		// We need to grab the href before clicking, as after clicking the DOM may change. For Stats, for example, we go to WP-Admin.
		const hrefItemSelector = ( await this.page.getAttribute( itemSelector, 'href' ) ) as string;

		await this.page.dispatchEvent( itemSelector, 'click' );

		// Sub-level menu item selector.
		if ( subitem ) {
			// Clicking the top-level item may trigger a client-side React
			// navigation or a full page load. Either way, wait for the
			// expanded submenu and the specific subitem link to be visible
			// before interacting with it. Use a single locator instance for
			// all operations to avoid inconsistency if the DOM changes.
			const subitemLocator = this.page
				.locator(
					`.is-toggle-open a:has(:text-is("${ subitem }")), .wp-menu-open .wp-submenu a:text-is("${ subitem }")`
				)
				.first();
			await subitemLocator.waitFor();
			const hrefSubItemSelector = ( await subitemLocator.getAttribute( 'href' ) ) as string;

			await subitemLocator.dispatchEvent( 'click' );
			await this.page.waitForURL( `**${ hrefSubItemSelector }`, {
				waitUntil: 'domcontentloaded',
			} );
		} else {
			// Otherwise wait for navigation after clicking the top level item.
			await this.page.waitForURL( `**${ hrefItemSelector }`, {
				waitUntil: 'domcontentloaded',
			} );
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

		// Verify the expected item or subitem is selected. Some Calypso routes
		// redirect out of Calypso shortly after loading (eg. to the Multi-site
		// Dashboard), and may do so after the out-of-Calypso check above has
		// already passed. Treat leaving Calypso as an alternative success signal.
		const locator = this.page.locator( selectedMenuItem );
		await Promise.any( [
			locator.waitFor( { state: 'attached' } ),
			this.page.waitForURL( ( url ) => ! url.href.startsWith( getCalypsoURL() ) ),
		] );
	}

	/**
	 * Navigates to given (sub)item of the wp-admin menu.
	 *
	 * @param {string} item Plaintext representation of the top level heading.
	 * @param {string} subitem Plaintext representation of the child level heading.
	 */
	private async navigateWpAdmin( item: string, subitem?: string ): Promise< void > {
		const isMobile = envVariables.VIEWPORT_NAME === 'mobile';

		// The menu's toggle and flyouts are wired by wp-admin's scripts, which run before load.
		await Promise.all( [
			this.page.waitForLoadState( 'load', { timeout: 30 * 1000 } ),
			this.page
				.locator( selectors.wpAdminMenu )
				.waitFor( { state: 'attached', timeout: 30 * 1000 } ),
		] );

		// Narrow viewports hide the menu behind the admin bar toggle.
		if ( isMobile ) {
			await this.page.locator( selectors.wpAdminMenuToggle ).click();
			await this.page.locator( selectors.wpAdminMenuOpen ).waitFor();
		}

		const itemLocator = this.page.locator( selectors.wpAdminMenuItem( item ) );
		let linkLocator = itemLocator.locator( '> a' );

		// Desktop opens a submenu as a flyout on hover; the responsive menu expands it on tap
		// instead of following the link.
		if ( subitem ) {
			if ( isMobile ) {
				await linkLocator.click();
			} else {
				await linkLocator.hover();
			}

			linkLocator = itemLocator.locator( selectors.wpAdminSubmenuLink( subitem ) );
			await linkLocator.waitFor();
		}

		const href = await linkLocator.getAttribute( 'href' );

		if ( href === null ) {
			throw new Error( `wp-admin menu item "${ subitem ?? item }" has no link.` );
		}

		const url = new URL( href, this.page.url() );
		const calypsoURL = toCalypsoURL( url.href );

		// Links into Calypso point at production; open the same page on the Calypso under test.
		if ( calypsoURL !== url.href ) {
			await this.page.goto( calypsoURL );
			return;
		}

		// A flyout can reach below the viewport, and scrolling to it ends the hover that holds
		// it open, so the click is dispatched like the sidebar's. Waiting on the new document
		// rather than a URL: wp-admin targets can share the current page's path
		// (admin.php?page=…), or redirect on arrival (plugins.php).
		const loaded = this.page.waitForEvent( 'domcontentloaded', { timeout: 30 * 1000 } );
		await linkLocator.dispatchEvent( 'click' );
		await loaded;
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
