import { ElementHandle, Page } from 'playwright';
import { getTargetDeviceName } from '../../browser-helper';
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
		const sidebarElementHandle = await this.page.waitForSelector( selectors.sidebar );
		await sidebarElementHandle.waitForElementState( 'stable' );

		return sidebarElementHandle;
	}

	/**
	 * Navigates to given (sub)item of the sidebar menu.
	 *
	 * @param {string} item Plaintext representation of the top level heading.
	 * @param {string} subitem Plaintext representation of the child level heading.
	 * @param {number} retries Number of retries in the case of navigation failure.
	 * @returns {Promise<void>} No return value.
	 */
	async navigate( item: string, subitem?: string, retries = 3 ): Promise< void > {
		if ( getTargetDeviceName() === 'mobile' ) {
			await this.openMobileSidebar();
		}

		const itemSelector = `${ selectors.sidebar } :text-is("${ item }"):visible`;
		await this.scrollItemIntoViewIfNeeded( itemSelector );

		if ( subitem ) {
			// Click top-level item without waiting for navigation if targeting subitem.
			await this.page.click( itemSelector );

			const subitemSelector = `.is-toggle-open :text-is("${ subitem }"):visible`;
			await this.scrollItemIntoViewIfNeeded( subitemSelector );

			await Promise.all( [ this.page.waitForNavigation(), this.page.click( subitemSelector ) ] );
		} else {
			await Promise.all( [ this.page.waitForNavigation(), this.page.click( itemSelector ) ] );
		}

		/**
		 * Do not attempt to retry if we've navigated outside wp.com as the sidebar
		 * is no longer present.
		 */
		const currentURL = await this.page.url();
		if ( ! currentURL.startsWith( 'https://wordpress.com' ) ) {
			return;
		}

		/**
		 * Retry if the click missed the expected item. This can happen because of
		 * the lazy-loading nature of the sidenav items.
		 */
		try {
			const selectedItemSelector = `${ selectors.sidebar } .selected :text-is("${
				subitem || item
			}")`;
			await this.page.waitForSelector( selectedItemSelector, {
				timeout: 3000,
				state: 'attached',
			} );
			return;
		} catch {
			if ( retries === 0 ) {
				const itemPath = subitem ? `${ item } > ${ subitem }` : item;
				throw new Error( `Couldn't navigate to ${ itemPath }: Expected (sub)item was not active.` );
			}
			await this.page.reload();
			return this.navigate( item, subitem, retries - 1 );
		}
	}

	/**
	 * Scrolls to reveal the target element if required. This workaround is necessary as the sidebar
	 * is 'sticky' in calypso, so a traditional scroll behavior does not adequately expose the sidebar
	 * element.
	 *
	 * @param {string} selector Selector for for the target item.
	 * @returns {Promise<ElementHandle>} The evaluated element's handle.
	 */
	async scrollItemIntoViewIfNeeded( selector: string ): Promise< ElementHandle > {
		const elementHandle = await this.page.waitForSelector( selector, { state: 'attached' } );

		await this.page.evaluate( ( element ) => {
			const elementBottom = element.getBoundingClientRect().bottom;
			const isOutsideViewport = window.innerHeight < elementBottom;

			if ( isOutsideViewport ) {
				window.scrollTo( 0, elementBottom - window.innerHeight );
			}
		}, elementHandle );

		return elementHandle;
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
