/**
 * Internal dependencies
 */
import { MasterbarComponent, SidebarComponent } from '../components';
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
	 * Starts a new post in the Gutenberg editor by clicking the "Write" button in the Masterbar
	 * header.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async startNewPostFromMasterbar(): Promise< void > {
		const masterbarComponent = await MasterbarComponent.Expect( this.page );
		await masterbarComponent.clickWriteButton();
		await GutenbergEditorPage.Expect( this.page );
	}
}
