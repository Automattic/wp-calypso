/**
 * Internal dependencies
 */
import { NavbarComponent } from '../components';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

/**
 * Handles all sorts of flows related to starting a new post.
 */
export class NewPostFlow {
	page: Page;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page Instance of a browser page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Starts a new post from the navbar/masterbar button.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async newPostFromNavbar(): Promise< void > {
		const navbar = new NavbarComponent( this.page );
		await navbar.clickNewPost();
	}
}
