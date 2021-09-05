import { Page } from 'playwright';
import { NavbarComponent, SidebarComponent } from '../components';
import { GutenbergEditorPage } from '../pages';

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
		// Clicking on Nav bar buttons before we have a full sidebar will actually "swallow" the click without doing anything!
		// So it's important to make sure the sidebar is there first to avoid a race condition.
		await new SidebarComponent( this.page ).waitForSidebarInitialization();
		const navbarComponent = new NavbarComponent( this.page );
		await navbarComponent.clickNewPost();
		const gutenbergEditorPage = new GutenbergEditorPage( this.page );
		await gutenbergEditorPage.waitUntilLoaded();
	}
}
