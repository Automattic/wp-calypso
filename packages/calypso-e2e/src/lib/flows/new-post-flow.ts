/**
 * Internal dependencies
 */
import { NavbarComponent, SidebarComponent } from '../components';
import { GutenbergEditorPage } from '../pages';

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
		await SidebarComponent.Expect( this.page );
		const navbarComponent = await NavbarComponent.Expect( this.page );
		await navbarComponent.clickNewPost();
		await GutenbergEditorPage.Expect( this.page );
	}
}
