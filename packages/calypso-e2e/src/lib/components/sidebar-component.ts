import { ElementHandle, Page } from 'playwright';
import { getViewportName } from '../../browser-helper';
import { NavbarComponent } from './navbar-component';

const selectors = {
	// Mobile view
	layout: '.layout',

	// Sidebar
	sidebar: '.sidebar',
	heading: '.sidebar > li',
	subheading: '.sidebar__menu-item--child',
	expandedMenu: '.sidebar__menu.is-toggle-open',

	// Sidebar regions
	currentSiteCard: '.card.current-site',
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
	 * Waits for the wrapper of the sidebar to be initialized on the page, then returns the element handle for that sidebar
	 *
	 * @returns the ElementHandle for the sidebar
	 */
	async waitForSidebarInitialization(): Promise< ElementHandle > {
		return await this.page.waitForSelector( selectors.sidebar );
	}

	/**
	 * Navigates to given (sub)item of the sidebar navigation.
	 *
	 * @param {{[key: string]: string}} param0 Named object parameter.
	 * @param {string} param0.item Plaintext representation of the top level heading.
	 * @param {string} param0.subitem Plaintext representation of the child level heading.
	 * @returns {Promise<void>} No return value.
	 */
	async gotoMenu( { item, subitem }: { item: string; subitem?: string } ): Promise< void > {
		if ( getViewportName() === 'mobile' ) {
			await this._openMobileSidebar();
		}

		const itemSelector = `.sidebar >> text="${ item }"`;
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( itemSelector ) ] );

		if ( subitem ) {
			await Promise.all( [
				this.page.waitForNavigation(),
				this.page.click( `${ itemSelector } >> text="${ subitem }"` ),
			] );
		}

		/**
		 * Retry if the click missed the expected item. This can happen because of
		 * the lazy-loading nature of the sidenav items.
		 */
		try {
			const selectedItemSelector = `.sidebar .selected >> text="${ subitem || item }"`;
			await this.page.waitForSelector( selectedItemSelector, {
				timeout: 3000,
			} );
			return;
		} catch {
			await this.page.reload();
			return this.gotoMenu( { item, subitem } );
		}
	}

	/**
	 * Opens the sidebar into view for mobile viewports.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _openMobileSidebar(): Promise< void > {
		await this.waitForSidebarInitialization();
		const navbarComponent = new NavbarComponent( this.page );
		await navbarComponent.clickMySites();
		// `focus-sidebar` attribute is added once the sidebar is opened and focused in mobile view.
		const layoutElement = await this.page.waitForSelector( `${ selectors.layout }.focus-sidebar` );
		await layoutElement.waitForElementState( 'stable' );
	}

	/**
	 * Performs the underlying click action on a sidebar menu item.
	 *
	 * This method ensures the sidebar is in a stable, consistent state prior to executing its actions,
	 * scrolls the sidebar and main content to expose the target element in the viewport, then
	 * executes a click.
	 *
	 * @param {string} selector Any selector supported by Playwright.
	 * @returns {Promise<void>} No return value.
	 */
	async _click( selector: string ): Promise< void > {
		await this.page.waitForLoadState( 'load' );

		const elementHandle = await this.page.waitForSelector( selector, { state: 'attached' } );

		// Scroll to reveal the target element fully using a page function if required.
		// This workaround is necessary as the sidebar is 'sticky' in calypso, so a traditional
		// scroll behavior does not adequately expose the sidebar element.
		await this.page.evaluate(
			( [ element ] ) => {
				const elementBottom = element.getBoundingClientRect().bottom;
				const isOutsideViewport = window.innerHeight < elementBottom;

				if ( isOutsideViewport ) {
					window.scrollTo( 0, elementBottom - window.innerHeight );
				}
			},
			[ elementHandle ]
		);

		// Use page.click since if the ElementHandle moves or otherwise disappears from the original
		// location in the DOM, it is no longer valid and will throw an error.
		// For Atomic sites, sidebar items often shift soon after initial rendering as Atomic-specific
		// features are loaded.
		// See https://github.com/microsoft/playwright/issues/6244#issuecomment-824384845.
		await this.page.click( selector );

		await this.page.waitForLoadState( 'load' );
	}
}
