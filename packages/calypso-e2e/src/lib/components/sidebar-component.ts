/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';
import { toTitleCase } from '../../data-helper';

/**
 * Type dependencies
 */
import { ElementHandle, Page } from 'playwright';

const selectors = {
	sidebar: '.sidebar',
	heading: '.sidebar > li:not(.sidebar__menu-item--child)',
	subheading: '.sidebar__menu-item--child',
	expandedMenu: '.sidebar__menu--selected',
};

/**
 * Component representing the sidebar on the dashboard of WPCOM.
 *
 * @augments {BaseContainer}
 */
export class SidebarComponent extends BaseContainer {
	sidebar!: ElementHandle;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		super( page, selectors.sidebar );
	}

	/**
	 * Post-initialization steps of this object.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		await this.page.waitForLoadState( 'domcontentloaded' );
		this.sidebar = await this.page.waitForSelector( selectors.sidebar );
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
	 * @param {string} param0.heading Plaintext representation of the top level heading.
	 * @param {string} param0.subheading Plaintext representation of the child level heading.
	 * @returns {Promise<void>} No return value.
	 */
	async gotoMenu( {
		heading,
		subheading,
	}: {
		heading?: string;
		subheading?: string;
	} ): Promise< void > {
		if ( heading ) {
			heading = toTitleCase( heading ).trim();
			// This will exclude entries where the `heading` term matches multiple times
			// eg. `Settings` but they are sub-headings in reality, such as Jetpack > Settings.
			// Since the sub-headings are always hidden unless heading is selected, this works to
			// our advantage.
			const selector = `${ selectors.heading } span:has-text("${ heading }"):visible`;
			await Promise.all( [ this.page.waitForNavigation(), this._click( { selector: selector } ) ] );
		}

		if ( subheading ) {
			subheading = toTitleCase( subheading ).trim();
			// If there is a subheading, the expanded menu element will always be present.
			await this.sidebar.waitForSelector( selectors.expandedMenu );
			// Explicitly select only the child headings and combine with the text matching engine.
			// This works better than using CSS pseudo-classes like `:has-text` or `:text-matches`
			// as those approaches result in the element not being clickable.
			const selector = `${ selectors.subheading } >> text="${ subheading }"`;
			await Promise.all( [
				this.page.waitForNavigation(),
				this._click( { selector: selector, force: true } ),
			] );
		}
	}

	/**
	 * Performs the underlying click action on a sidebar menu item.
	 *
	 * This method ensures the sidebar is in a stable, consistent state prior to executing its actions.
	 *
	 * In some cases, due to the way WPCOM sidebar is implemented, Playwright will struggle to scroll the menu item
	 * into the viewport in order to perform the click action. This is a particular issue with child-level menu
	 * items (eg. Settings > Reading). Set the `force` parameter to true to force a click action to occur regardless
	 * of the visibility state of the target element.
	 *
	 * @param {{[key: string]: string|boolean}} param0 Named object parameter.
	 * @param {string} param0.selector Any selector supported by Playwright.
	 * @param {boolean} [param0.force] Whether to force a click action. Defaults to false.
	 * @returns {Promise<void>} No return value.
	 */
	async _click( {
		selector,
		force = false,
	}: {
		selector: string;
		force?: boolean;
	} ): Promise< void > {
		// Wait for these promises in no particular order. We simply want to ensure the sidebar
		// and the page is in a state to accept inputs.
		await Promise.all( [
			this.page.waitForLoadState( 'domcontentloaded' ),
			this.sidebar.waitForElementState( 'stable' ),
		] );

		const element = await this.page.waitForSelector( selector, { state: 'visible' } );

		if ( ! force ) {
			await element.click();
		} else {
			// Programatically send a `click` event regardless of element visibility.
			// This eliminates the need to scroll the sidebar to expose the menu item,
			// which Playwright struggles with for some reason.
			// For more information on events, see https://playwright.dev/docs/api/class-elementhandle#element-handle-dispatch-event
			await element.dispatchEvent( 'click' );
		}
		await this.page.waitForLoadState( 'domcontentloaded' );
	}
}
