/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { ElementHandle, Page } from 'playwright';

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

	async _postInit(): Promise< void > {
		await this.page.waitForLoadState( 'networkidle' );
	}

	/**
	 * Locates and returns the ElementHandle matching the given string identifier.
	 *
	 * @param {string} name Plaintext name of the menu item in the sidebar.
	 * @returns {Promise<ElementHandle>} ElementHandle matching the name.
	 * @throws {Error} If name did not match any visible sidebar menu item.
	 */
	async _getMenuItemHandle( name: string ): Promise< ElementHandle > {
		const sanitizedName = name.toProperCase();
		const handle = await this.page.$( `text=${ sanitizedName }` );
		if ( ! handle ) {
			throw new Error( `Menu item ${ sanitizedName } not found in the sidebar.` );
		}
		return handle;
	}

	/**
	 * Clicks on the sidebar menu item matching the name.
	 * Note that the menu item must be visible in some shape or form.
	 *
	 * @param {string} name Plaintext name of the menu item in the sidebar.
	 */
	async clickMenuItem( name: string ): Promise< void > {
		const handle = await this._getMenuItemHandle( name );

		await handle.click();
	}

	/**
	 * Hovers over the sidebar menu item matching the name.
	 *
	 * @param {string} name Plaintext name of the menu item in the sidebar.
	 */
	async hoverMenuItem( name: string ): Promise< void > {
		const handle = await this._getMenuItemHandle( name );

		await handle.hover();
	}
}
