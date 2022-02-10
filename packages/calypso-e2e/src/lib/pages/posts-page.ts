import { Page, Response } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { reloadAndRetry } from '../../element-helper';

type TrashedMenuItems = 'Restore' | 'Copy link' | 'Delete Permanently';

type MenuItems = TrashedMenuItems;

const selectors = {
	// General
	placeholder: `div.is-placeholder`,

	// Post Item
	postItem: ( title: string ) => `div.post-item:has([data-e2e-title="${ title }"])`,

	// Menu
	menuToggleButton: 'button[title="Toggle menu"]',
	menuItem: ( item: string ) => `button[role="menuitem"]:has-text("${ item }")`,
};

/**
 * Represents the Posts page.
 */
export class PostsPage {
	private page: Page;

	/**
	 * Creates an instance of the page.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Opens the Posts page.
	 *
	 * Example {@link https://wordpress.com/posts}
	 */
	async visit(): Promise< Response | null > {
		const response = await this.page.goto( getCalypsoURL( 'posts' ) );
		await this.waitUntilLoaded();
		return response;
	}

	/* Page readiness */

	/**
	 * Wait until the page is completely loaded.
	 */
	async waitUntilLoaded(): Promise< void > {
		await this.page.waitForSelector( selectors.placeholder, { state: 'detached' } );
	}

	/**
	 * Ensures the post item denoted by the parameter `title` is shown on the page.
	 * This method is a superset of the `waitUntilLoaded` method.
	 *
	 * Due to a race condition, sometimes the expected post does not appear
	 * on the list of posts. This can occur when state for multiple posts are being modified
	 * at the same time (eg. several posts being trashed).
	 *
	 * @param {string} title Post title.
	 */
	private async ensurePostShown( title: string ): Promise< void > {
		await this.waitUntilLoaded();

		/**
		 * Closure to wait until the post to appear in the list of posts.
		 *
		 * @param {Page} page Page object.
		 */
		async function waitForPostToAppear( page: Page ): Promise< void > {
			const postLocator = page.locator( selectors.postItem( title as string ) );
			await postLocator.waitFor( { state: 'visible', timeout: 20 * 1000 } );
		}

		await reloadAndRetry( this.page, waitForPostToAppear );
	}

	/* Post actions */

	/**
	 * Given a post title, click on the post, triggering a navigation
	 * to the editor page.
	 *
	 * @param {string} title Partial or full string of the post.
	 */
	async clickPost( title: string ): Promise< void > {
		await this.ensurePostShown( title );

		const locator = this.page.locator( selectors.postItem( title ) );
		await locator.click();
	}

	/**
	 * Toggles the Post Menu (hamberger menu) of a matching post.
	 *
	 * @param {string} title Post title on which the menu should be toggled.
	 */
	async togglePostMenu( title: string ): Promise< void > {
		await this.ensurePostShown( title );

		const locator = this.page.locator(
			`${ selectors.postItem( title ) } ${ selectors.menuToggleButton }`
		);
		await locator.click();
	}

	/* Menu actions */

	/**
	 * Given a post title and target menu item, performs the following actions:
	 * 	- locate the post with matching title.
	 * 	- toggle the post menu.
	 * 	- click on an menu action with matching name.
	 *
	 * @param param0 Object parameter.
	 * @param {string} param0.title Title of the post.
	 * @param {MenuItems} param0.action Name of the target action in the menu.
	 */
	async clickMenuItemForPost( {
		title,
		action,
	}: {
		title: string;
		action: MenuItems;
	} ): Promise< void > {
		await this.ensurePostShown( title );

		await this.togglePostMenu( title );
		await this.clickMenuItem( action );
	}

	/**
	 * Clicks on the menu item.
	 *
	 * @param {string} menuItem Target menu item.
	 */
	private async clickMenuItem( menuItem: string ): Promise< void > {
		const locator = this.page.locator( selectors.menuItem( menuItem ) );

		// {@TODO} In the future, a possible idea may be to implement a following structure:
		// pre-process
		// perform the menu click
		// post-process
		// This is because sometimes the action performed on the menu may require additional
		// pre- and post-processing, such as in the case of Delete Permanently.
		// The pre-process and post-process actions are to be called through either a
		// case-switch statement, or by locating and exeucting predefined function in
		// an dictionary object, keyed by the value of menuItem.

		if ( menuItem === 'Delete Permanently' ) {
			this.page.once( 'dialog', async ( dialog ) => {
				await dialog.accept();
			} );
		}

		await locator.click();

		if ( menuItem === 'Delete Permanently' ) {
			await this.page.waitForResponse( /.*delete.*/ );
		}
	}
}
