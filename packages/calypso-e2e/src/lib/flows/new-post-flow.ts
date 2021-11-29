import path from 'path';
import { Page } from 'playwright';
import { DataHelper } from '../..';
import { NavbarComponent, SidebarComponent } from '../components';
import { GutenbergEditorPage, LoginPage } from '../pages';

/**
 * Handles all sorts of flows related to starting a new post.
 */
export class NewPostFlow {
	private isLoggedIn: boolean;
	page: Page;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page Instance of a browser page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.isLoggedIn = false;
	}

	/**
	 * Starts a new post by directly going to the default site of the given
	 * account. Logs in if necessary.
	 *
	 * @param user The username of the account to start the post with
	 * @returns An instance of the GutenbergEditorPage class
	 */
	async startImmediately( user: string ): Promise< GutenbergEditorPage > {
		const calypsoURL = DataHelper.getCalypsoURL();
		const siteHost = DataHelper.getAccountSiteURL( user, { protocol: false } );

		await this.page.goto( path.join( calypsoURL, 'post', siteHost ) );

		if ( ! this.isLoggedIn ) {
			await new LoginPage( this.page ).fillAndSubmit( { account: user } );
			this.isLoggedIn = true;
		}

		return new GutenbergEditorPage( this.page );
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
