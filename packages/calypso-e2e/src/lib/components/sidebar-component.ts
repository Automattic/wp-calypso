import { ElementHandle, Page } from 'playwright';
import { getTargetDeviceName } from '../../browser-helper';
import { getCalypsoURL } from '../../data-helper';
import { NavbarComponent } from './navbar-component';

const selectors = {
	sidebar: '.sidebar',
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
	 * Waits for the wrapper of the sidebar to be initialized on the page, then returns the element
	 * handle for that sidebar.
	 *
	 * @returns the ElementHandle for the sidebar
	 */
	async waitForSidebarInitialization(): Promise< ElementHandle > {
		await this.page.waitForLoadState( 'load' );
		const sidebarElementHandle = await this.page.waitForSelector( selectors.sidebar );
		await sidebarElementHandle.waitForElementState( 'stable' );

		return sidebarElementHandle;
	}

	/**
	 * Navigates to given (sub)item of the sidebar menu.
	 *
	 * @param {string} item Plaintext representation of the top level heading.
	 * @param {string} subitem Plaintext representation of the child level heading.
	 * @returns {Promise<void>} No return value.
	 */
	async navigate( item: string, subitem?: string ): Promise< void > {
		await this.waitForSidebarInitialization();

		if ( getTargetDeviceName() === 'mobile' ) {
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

		/**
		 * Do not verify selected menu items or retry if navigation takes user out of
		 * Calypso (eg. WP-Admin, Widgets editor).
		 */
		const currentURL = this.page.url();
		if ( ! currentURL.startsWith( getCalypsoURL() ) ) {
			return;
		}

		// Some menu items (eg. Comments, Stats) do not have a submenu. In these cases,
		// the `.selected` class is applied to the top level menu.
		let selectedMenuItem = `${ selectors.sidebar } .selected :text-is("${ item }")`;

		if ( subitem ) {
			selectedMenuItem = `${ selectors.sidebar } .selected :text-is("${ subitem }")`;
		}

		// Verify the expected item or subitem is selected.
		await Promise.all( [
			this.page.waitForSelector( selectedMenuItem, {
				timeout: 10000,
				state: 'attached',
			} ),
			this.page.waitForSelector( '.focus-content' ),
		] );
	}

	/**
	 * Clicks on the switch site menu item in the sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async switchSite(): Promise< void > {
		const device = getTargetDeviceName();

		await this.waitForSidebarInitialization();

		if ( device === 'mobile' ) {
			await this.openMobileSidebar();
		}

		await this.page.click( ':text("Switch Site")' );
		await this.page.waitForSelector( '.layout.focus-sites' );
	}

	/**
	 * Performs the underlying click action on a sidebar menu item.
	 *
	 * This method ensures the sidebar is in a stable, consistent state prior to executing its actions,
	 * scrolls the sidebar and main content to expose the target element in the viewport, then
	 * executes a click.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openMobileSidebar(): Promise< void > {
		await this.waitForSidebarInitialization();
		const navbarComponent = new NavbarComponent( this.page );
		await navbarComponent.clickMySites();
		// `focus-sidebar` attribute is added once the sidebar is opened and focused in mobile view.
		const layoutElement = await this.page.waitForSelector( '.layout.focus-sidebar' );
		await layoutElement.waitForElementState( 'stable' );
	}

	/**
	 * Clicks on the Add Site button at bottom of the site selector within the sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async addSite(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( 'a:text("Add New Site")' ),
		] );
	}
}
