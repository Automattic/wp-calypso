/**
 * Internal dependencies
 */
import { NavbarComponent, SidebarComponent } from '../components';
import { GutenbergEditorPage } from '../pages';
import { randomPhrase } from '../../data-helper';

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

	/**
	 * Starts and publishes a new post from the navbar/masterbar button.
	 *
	 * @returns {Promise<string>} URL to the published post.
	 */
	async getNewTestPost(): Promise< string > {
		await this.newPostFromNavbar();
		const gutenbergEditorPage = await GutenbergEditorPage.Expect( this.page );
		// Not too concerned with variation here so reuse the same phrase for title
		// and text.
		const phrase = randomPhrase();
		await gutenbergEditorPage.enterTitle( phrase );
		await gutenbergEditorPage.enterText( phrase );
		// Return the URL of the post.
		return await gutenbergEditorPage.publish( { getUrl: true } );
	}
}
