/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';
import { toTitleCase } from '../../data-helper';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	sidebar: '.sidebar',
};

/**
 * Component representing the sidebar on the dashboard of WPCOM.
 *
 * @augments {BaseContainer}
 */
export class SidebarComponent extends BaseContainer {
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
		await this.page.waitForLoadState( 'networkidle' );
	}

	/**
	 * Clicks on the sidebar menu item matching the name.
	 * Note that the menu item must be visible in some shape or form.
	 * If there are multiple elements that match the selector, the first
	 * matching element will be clicked (as per Playwright documentation).
	 * Waits and assertions should be placed on the page/component that this
	 * method will cause a navigation to, to ensure readiness before the script
	 * continues.
	 *
	 * @param {string} name Plaintext name of the menu item in the sidebar.
	 * @returns {Promise<void>} No return value.
	 */
	async clickMenuItem( name: string ): Promise< void > {
		await this.page.click( `text=${ toTitleCase( name ) }` );
	}

	/**
	 * Hovers over the sidebar menu item matching the name.
	 *
	 * @param {string} name Plaintext name of the menu item in the sidebar.
	 * @returns {Promise<void>} No return value.
	 */
	async hoverMenuItem( name: string ): Promise< void > {
		const element = await this.page.waitForSelector( `text=${ toTitleCase( name ) }` );
		await element.hover();
	}
}
