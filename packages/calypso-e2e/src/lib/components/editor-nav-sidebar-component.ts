import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

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
	private editor: EditorComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorComponent} editor The EditorComponent instance.
	 */
	constructor( page: Page, editor: EditorComponent ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Exits the editor.
	 *
	 * Clicks the Dashboard menu link to exit the editor.
	 */
	async exitEditor(): Promise< void > {
		const editorParent = await this.editor.parent();
		const exitLinkLocator = editorParent.locator( selectors.exitLink );
		await exitLinkLocator.click();
	}
}
