import { Page, Locator } from 'playwright';

const panel = '.wpcom-block-editor-nav-sidebar-nav-sidebar__container';
const selectors = {
	exitLink: `${ panel } a[aria-description="Returns to the dashboard"]`,
};

/**
 * Represents an instance of the WordPress.com Editor's navigation sidebar.
 * The component is available only in the Desktop viewport for the post editor.
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
		const exitLinkLocator = this.editor.locator( selectors.exitLink );
		await exitLinkLocator.click();
	}
}
