import { Page, Response } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { reloadAndRetry } from '../../element-helper';

type TrashedMenuItems = 'Restore' | 'Copy link' | 'Delete Permanently';
type GenericMenuItems = 'Trash';

type MenuItems = TrashedMenuItems | GenericMenuItems;
type PostsPageTabs = 'Published' | 'Drafts' | 'Scheduled' | 'Trash';

const selectors = {
	// General
	addNewPostButton: 'a.page-title-action, span.split-page-title-action>a',

	// Post Item
	postRow: 'tr.type-post',
	postItem: ( title: string ) =>
		`a.row-title:has-text("${ title }"), strong>span:has-text("${ title }")`,

	// Status Filter
	statusItem: ( item: string ) => `ul.subsubsub a:has-text("${ item }")`,

	// Actions
	actionItem: ( item: string ) => `.row-actions a:has-text("${ item }")`,
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
	async visit( { siteSlug = '' }: { siteSlug?: string } = {} ): Promise< Response | null > {
		const response = await this.page.goto( getCalypsoURL( 'posts' ) );

		if ( siteSlug ) {
			const siteLink = this.page.locator( `a:has-text("${ siteSlug }")` ).first();
			const appeared = await siteLink
				.waitFor( { state: 'visible', timeout: 5000 } )
				.then( () => true )
				.catch( () => false );

			if ( appeared ) {
				await siteLink.click( { noWaitAfter: true } );
				await this.page.waitForFunction(
					() => /\/posts\/|\/wp-admin\/edit\.php|\/home\//.test( window.location.pathname ),
					undefined,
					{ timeout: 20 * 1000 }
				);
			}

			// Some account/site combinations can still land on Home after site selection.
			// Force a site-scoped Posts route so wp-admin post table actions are available.
			if ( /\/home\//.test( new URL( this.page.url() ).pathname ) ) {
				await this.page.goto( getCalypsoURL( `posts/${ siteSlug }` ), {
					timeout: 30 * 1000,
					waitUntil: 'domcontentloaded',
				} );
			}
		}

		return response;
	}

	/**
	 * Clicks on the navigation tab.
	 *
	 * @param {string} name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( name: PostsPageTabs ): Promise< void > {
		const locator = this.page.locator( selectors.statusItem( name ) );
		await locator.click();
	}

	/* Page readiness */

	/**
	 * Ensures the post item denoted by the parameter `title` is shown on the page.
	 *
	 * Due to a race condition, sometimes the expected post does not appear
	 * on the list of posts. This can occur when state for multiple posts are being modified
	 * at the same time (eg. several posts being trashed).
	 *
	 * @param {string} title Post title.
	 */
	private async ensurePostShown( title: string ): Promise< void > {
		/**
		 * Closure to wait until the post to appear in the list of posts.
		 *
		 * @param {Page} page Page object.
		 */
		async function waitForPostToAppear( page: Page ): Promise< void > {
			const postLocator = page.locator( `${ selectors.postRow } ${ selectors.postItem( title ) }` );
			await postLocator.waitFor( { state: 'visible', timeout: 20 * 1000 } );
		}

		await reloadAndRetry( this.page, waitForPostToAppear );
	}

	/**
	 * Clicks on the `add new post` button.
	 */
	async newPost( { siteSlug = '' }: { siteSlug?: string } = {} ): Promise< void > {
		const locator = this.page.locator( selectors.addNewPostButton );

		const hasEditorPath = ( pathName: string ): boolean =>
			/(^\/post(?:\/[^/?#]+)?\/?$)|(^\/post-new\.php$)|(^\/wp-admin\/post-new\.php$)/.test(
				pathName
			);

		const addNewVisible = await locator
			.first()
			.waitFor( { state: 'visible', timeout: 5000 } )
			.then( () => true )
			.catch( () => false );

		if ( addNewVisible ) {
			await Promise.all( [
				this.page.waitForFunction(
					( regexSource ) => new RegExp( regexSource ).test( window.location.pathname ),
					/(^\/post(?:\/[^/?#]+)?\/?$)|(^\/post-new\.php$)|(^\/wp-admin\/post-new\.php$)/.source,
					{ timeout: 20 * 1000 }
				),
				locator.click( { noWaitAfter: true } ),
			] );
		} else if ( siteSlug ) {
			await this.page.goto( getCalypsoURL( `post/${ siteSlug }` ), {
				timeout: 30 * 1000,
				waitUntil: 'domcontentloaded',
			} );
		}

		if ( ! hasEditorPath( new URL( this.page.url() ).pathname ) ) {
			throw new Error( `Expected to navigate to a post editor route, got ${ this.page.url() }` );
		}
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

		const locator = this.page.locator( `${ selectors.postRow } ${ selectors.postItem( title ) }` );
		await locator.click();
	}

	/**
	 * Toggles the Post Actions of a matching post.
	 *
	 * @param {string} title Post title on which the actions should be toggled.
	 */
	async togglePostActions( title: string ): Promise< void > {
		await this.ensurePostShown( title );

		const locator = this.page.locator( selectors.postRow, {
			has: this.page.locator( selectors.postItem( title ) ),
		} );
		await locator.hover();
	}

	/* Menu actions */

	/**
	 * Given a post title and target action item, performs the following actions:
	 * 	- locate the post with matching title.
	 * 	- toggle the post action.
	 * 	- click on an action with matching name.
	 *
	 * @param param0 Object parameter.
	 * @param {string} param0.title Title of the post.
	 * @param {MenuItems} param0.action Name of the target action in the menu.
	 */
	async clickActionItemForPost( {
		title,
		action,
	}: {
		title: string;
		action: MenuItems;
	} ): Promise< void > {
		await this.ensurePostShown( title );

		await this.togglePostActions( title );
		await this.clickActionItem( title, action );
	}

	/**
	 * Clicks on the action item.
	 *
	 * @param {string} title Title of the post.
	 * @param {string} menuItem Target menu item.
	 */
	private async clickActionItem( title: string, menuItem: string ): Promise< void > {
		const locator = this.page.locator( selectors.postRow, {
			has: this.page.locator( selectors.postItem( title ) ),
		} );
		await locator.locator( selectors.actionItem( menuItem ) ).click();
	}
}
