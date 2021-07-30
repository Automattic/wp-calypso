import { ElementHandle, Page } from 'playwright';
import { getViewportName } from '../../browser-helper';
import { toTitleCase } from '../../data-helper';
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
	 * Given heading and subheading, or any combination of the two, locate and click on the items on the sidebar.
	 *
	 * This method supports any of the following use cases:
	 *   - heading only
	 *   - subheading only
	 *   - heading and subheading
	 *
	 * Heading is defined as the top-level menu item that is permanently visible on the sidebar, unless outside
	 * of the viewport.
	 *
	 * Subheading is defined as the child-level menu item that is exposed only on hover or by toggling open the listing by clicking on the parent menu item.
	 *
	 * Note, in the current Nav Unification paradigm, clicking on certain combinations of sidebar menu items will trigger
	 * navigation away to an entirely new page (eg. wp-admin). Attempting to reuse the SidebarComponent object
	 * under this condition will throw an exception from the Playwright engine.
	 *
	 * @param {{[key: string]: string}} param0 Named object parameter.
	 * @param {string} param0.item Plaintext representation of the top level heading.
	 * @param {string} param0.subitem Plaintext representation of the child level heading.
	 * @returns {Promise<void>} No return value.
	 */
	async gotoMenu( { item, subitem }: { item: string; subitem?: string } ): Promise< void > {
		let selector;
		const viewportName = getViewportName();

		// Especially on mobile devices, there can be a race condition in clicking on "My Sites" button
		// to slide in the sidebar, and that sidebar actually being initialized! So we want to wait
		// and make sure the sidebar is actually in the DOM before proceeding.
		await this.page.waitForSelector( selectors.sidebar );

		// If mobile, sidebar is hidden by default and focus is on the content.
		// The sidebar must be first brought into view.
		if ( viewportName === 'mobile' ) {
			await this._openMobileSidebar();
		}

		// Wait for the sidebar to finish loading all elements, including asynchronously loaded
		// offers and notices that may appear in the Current Site Card.
		await this._waitUntilMenuItemsLoaded( 50 );

		item = toTitleCase( item ).trim();
		// This will exclude entries where the `heading` term matches multiple times
		// eg. `Settings` but they are sub-headings in reality, such as Jetpack > Settings.
		// Since the sub-headings are always hidden unless heading is selected, this works to
		// our advantage by specifying to match only visible text.
		selector = `${ selectors.heading } span:has-text("${ item }"):visible`;
		await this._click( selector );

		if ( subitem ) {
			subitem = toTitleCase( subitem ).trim();
			// Explicitly select only the child headings and combine with the text matching engine.
			// This works better than using CSS pseudo-classes like `:has-text` or `:text-matches` for text
			// matching.
			selector = `${ selectors.subheading } >> text="${ subitem }"`;
			await this._click( selector );
		}

		// Confirm the focus is now back to the content, not the sidebar.
		await this.page.waitForSelector( `${ selectors.layout }.focus-content` );
	}

	/**
	 * Waits for the sidebar menu items to finish loading.
	 *
	 * The bounding box of the Current Site card (located at top of the sidebar) is compared
	 * every 250ms to determine whether loading has completed.
	 *
	 * On some sites, typically atomic, the sidebar undergoes multiple mutations of its structure:
	 * 	1. Shell of the sidebar gets created and remains static throughout the entire loading process.
	 * 	2. First version of the sidebar gets created and has only the original basic menu items.
	 * 	3. The mostly final version of the sidebar gets created. The parent element looks exactly the same
	 * 		but it is a new node that is attached in the DOM to replace the old one. This final version has
	 * 		all the menus from different plugins.
	 *	4. Offers and notices are loaded in a banner that pop in on the top of the sidebar. This does not
	 *		detach the parent sidebar, or any of the other elements, from the DOM. However, they do shift
	 *		down slightly on the page.
	 *
	 * The bounding box of the Current Site card is one of the last elements to stabilize in the loading
	 * process and its stability is a good indicator of the page stability.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	private async _waitUntilMenuItemsLoaded( delay: number ): Promise< void > {
		let loaded = false;
		while ( ! loaded ) {
			const elementHandle = await this.page.waitForSelector( selectors.currentSiteCard );
			const startingBoundingBox = await elementHandle.boundingBox();
			await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
			const currentBoundingBox = await elementHandle.boundingBox();
			// Height is the only factor that changes in the bounding box.
			if ( startingBoundingBox!.height === currentBoundingBox!.height ) {
				loaded = true;
			}
		}
	}

	/**
	 * Opens the sidebar into view for mobile viewports.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _openMobileSidebar(): Promise< void > {
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
