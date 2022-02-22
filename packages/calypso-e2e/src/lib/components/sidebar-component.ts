import { ElementHandle, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import envVariables from '../../env-variables';
import { NavbarComponent } from './navbar-component';

const selectors = {
	sidebar: '.sidebar',
	toggleCollapsedButton: '.collapse-sidebar__toggle > a.sidebar__menu-link',
	collapsedSidebar: 'body.is-sidebar-collapsed',
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

		// wait for active promotions to load because they can push the sidebar down, changing items positions
		await this.page
			.waitForResponse( ( r ) => Boolean( r.url().match( /active-promotions/i ) ), {
				timeout: 5000,
			} )
			.then( () => {
				// let active promotions render
				return this.page.waitForTimeout( 50 );
			} )
			.catch( () => console.log( 'Active promotions were not requested' ) );

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

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.openMobileSidebar();
		} else if ( await this.isSideBarCollapsed() ) {
			console.info( 'Sidebar is collapsed, expanding...' );
			await this.toggleSidebar();
		}

		// Top level menu item selector.
		const itemSelector = `${ selectors.sidebar } :text-is("${ item }"):visible`;

		if ( envVariables.VIEWPORT_NAME === 'mobile' || ! subitem ) {
			// when on mobile, or if the main item is the target, click it
			await this.page.dispatchEvent( itemSelector, 'click' );
		} else {
			//  only hover on Desktop when the goal is accessing a subitem
			await this.page.dispatchEvent( itemSelector, 'mouseover' );
		}

		// Sub-level menu item selector.
		if ( subitem ) {
			const subitemSelector = `.sidebar__menu-link :text-is("${ subitem }"):visible`;
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

		await this.page.click( ':text("Switch Site")' );
		await this.page.waitForSelector( '.layout.focus-sites' );
	}
	/**
	 * Toggles sidebar between expanded and collapsed
	 */
	async toggleSidebar(): Promise< void > {
		await this.page.click( selectors.toggleCollapsedButton, { force: true } );
	}

	/**
	 * Checks whether sidebar is collapsed
	 */
	async isSideBarCollapsed(): Promise< boolean > {
		return ( await this.page.locator( selectors.collapsedSidebar ).count() ) === 1;
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
