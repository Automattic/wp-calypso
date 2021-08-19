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
	private gotoItemRetryCount: number;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.gotoItemRetryCount = 3;
	}

	/**
	 * Waits for the wrapper of the sidebar to be initialized on the page, then returns the element
	 * handle for that sidebar.
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
			await this.openMobileSidebar();
		}

		const itemSelector = `${ selectors.sidebar } :text("${ item }")`;
		const itemElement = await this.scrollItemIntoViewIfNeeded( itemSelector );

		if ( subitem ) {
			// Click top-level item without waiting for navigation if targeting subitem.
			await itemElement.click();

			const subitemSelector = `${ selectors.sidebar } :text("${ subitem }"):below(${ itemSelector })`;
			const subitemElement = await this.scrollItemIntoViewIfNeeded( subitemSelector );

			await Promise.all( [ this.page.waitForNavigation(), subitemElement.click() ] );
		} else {
			await Promise.all( [ this.page.waitForNavigation(), itemElement.click() ] );
		}

		/**
		 * Retry if the click missed the expected item. This can happen because of
		 * the lazy-loading nature of the sidenav items.
		 */
		try {
			const selectedItemSelector = `${ selectors.sidebar } .selected :text("${ subitem || item }")`;
			await this.page.waitForSelector( selectedItemSelector, {
				timeout: 3000,
			} );
			return;
		} catch {
			if ( this.gotoItemRetryCount === 0 ) {
				throw new Error(
					`Couldn't navigate to ${ item } > ${ subitem }: Expected (sub)item was not active.`
				);
			}
			this.gotoItemRetryCount -= 1;
			await this.page.reload();
			return this.gotoMenu( { item, subitem } );
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
