import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

/**
 * Represents an instance of the WordPress.com FSE Editor's DataViews.
 * This is used for data layouts (e.g. tables, grids, and lists).
 */
export class FullSiteEditorDataViewsComponent {
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
	 * Clicks on a button with the exact name.
	 */
	async clickPrimaryFieldByExactText( primaryFieldText: string ): Promise< void > {
		const editorParent = await this.editor.parent();
		await editorParent.getByRole( 'button', { name: primaryFieldText } ).first().click();
	}
}
