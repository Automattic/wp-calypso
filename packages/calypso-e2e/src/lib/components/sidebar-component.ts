import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import envVariables from '../../env-variables';
import { NavbarComponent } from './navbar-component';

type FocusType = 'Sites' | 'Sidebar';

const selectors = {
	sidebar: '.sidebar',
	focusedLayout: ( focus: FocusType ) => `.layout.focus-${ focus.toLowerCase() }`,

	// Buttons and links within Sidebar
	linkWithText: ( text: string ) => `a:has-text("${ text }")`,
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
		await this.page.waitForLoadState( 'load' );
		const sidebarLocator = this.page.locator( selectors.sidebar );
		await sidebarLocator.waitFor();

		// If the sidebar is collapsed (via the Collapse Menu toggle),
		// re-expand the sidebar.
		if ( await this.sidebarIsCollapsed() ) {
			const sidebarCollapseToggle = this.page.locator( selectors.linkWithText( 'Collapse menu' ) );
			await sidebarCollapseToggle.dispatchEvent( 'click' );

			if ( await this.sidebarIsCollapsed() ) {
				throw new Error( 'Unable to expand sidebar.' );
			}
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
				this.page.waitForNavigation(),
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

	/* Viewport-specific methods */

	/**
	 * Determines whether the sidebar is in a collapsed state for desktop viewports.
	 *
	 * This check is part of the self-healing process for the sidebar-related end-to-end
	 * tests, as rest of the Sidebar methods rely on the sidebar in a non-collapsed
	 * state.
	 */
	private async sidebarIsCollapsed(): Promise< boolean > {
		const collapsedSidebarLocator = this.page.locator( '.is-sidebar-collapsed' );
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
		await navbarComponent.clickMySites();

		// `focus-sidebar` attribute is added to the main layout screen.
		const layoutElement = await this.page.waitForSelector( selectors.focusedLayout( 'Sidebar' ) );
		await layoutElement.waitForElementState( 'stable' );
	}
}
