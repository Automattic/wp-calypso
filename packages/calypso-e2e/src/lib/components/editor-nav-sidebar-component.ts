import { Page, Locator } from 'playwright';

// Support both site editor and post editor
const panel = '.wpcom-block-editor-nav-sidebar-nav-sidebar__container,.edit-site-navigation-panel';
const selectors = {
	menuLink: ( name: string ) => `${ panel } >> a:has-text("${ name }")`,
};

/**
 * Represents an instance of the WordPress.com Editor's navigation sidebar.
 * The component is available only in the Desktop viewport for the post editor.
 * It is visible on all viewports for the site editor.
 */
export class EditorNavSidebarComponent {
	private page: Page;
	private editor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {Locator} editor Locator or FrameLocator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Exits the editor.
	 *
	 * Clicks the Dashboard menu link to exit the editor.
	 */
	async exitEditor(): Promise< void > {
		const exitLinkLocator = this.editor.locator( selectors.menuLink( 'Dashboard' ) );
		await exitLinkLocator.click();
	}

	/**
	 * Clicks a navigation link from the menu in the navigation sidebar.
	 *
	 * @param {string} name Name of link to click.
	 */
	async clickMenuLink( name: string ): Promise< void > {
		const locator = this.editor.locator( selectors.menuLink( name ) );
		await locator.click();
	}
}
