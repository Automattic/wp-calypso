import { Page } from 'playwright';
import { EditorWindow } from './editor-window';

const panel = '.wpcom-block-editor-nav-sidebar-nav-sidebar__container';
const selectors = {
	exitLink: `${ panel } a[aria-description="Returns to the dashboard"]`,
};

/**
 * Represents an instance of the WordPress.com Editor's navigation sidebar.
 * The component is available only in the Desktop viewport for the post editor.
 */
export class EditorNavSidebarComponent extends EditorWindow {
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		super( page );
	}

	/**
	 * Exits the editor.
	 *
	 * Clicks the Dashboard menu link to exit the editor.
	 */
	async exitEditor(): Promise< void > {
		const editorFrame = await this.getEditorFrame();
		const exitLinkLocator = editorFrame.locator( selectors.exitLink );
		await exitLinkLocator.click();
	}
}
