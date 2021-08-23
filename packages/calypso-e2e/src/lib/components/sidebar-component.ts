import { ElementHandle, Page } from 'playwright';
import { getViewportName } from '../../browser-helper';
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
	 * @param {number} _retries Number of retries in the case of navigation failure.
	 * @returns {Promise<void>} No return value.
	 */
	async navigate( item: string, subitem?: string, _retries = 3 ): Promise< void > {
		if ( getViewportName() === 'mobile' ) {
			await this.openMobileSidebar();
		}

		const itemSelector = `${ selectors.sidebar } :text-is("${ item }"):visible`;
		await this.scrollItemIntoViewIfNeeded( itemSelector );

		if ( subitem ) {
			// Click top-level item without waiting for navigation if targeting subitem.
			await this.page.click( itemSelector );

			const subitemSelector = `:text-is("${ subitem }"):visible:below(${ itemSelector })`;
			await this.scrollItemIntoViewIfNeeded( subitemSelector );

			await Promise.all( [ this.page.waitForNavigation(), this.page.click( subitemSelector ) ] );
		} else {
			await Promise.all( [ this.page.waitForNavigation(), this.page.click( itemSelector ) ] );
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
			if ( _retries === 0 ) {
				const itemPath = subitem ? `${ item } > ${ subitem }` : item;
				throw new Error( `Couldn't navigate to ${ itemPath }: Expected (sub)item was not active.` );
			}
			await this.page.reload();
			return this.navigate( item, subitem, _retries - 1 );
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
	 * Opens the sidebar into view for mobile viewports.
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
}
