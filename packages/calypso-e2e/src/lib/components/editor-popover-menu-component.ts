import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

/**
 * Represents the popover menu that can be launched from multiple different places.
 */
export class EditorPopoverMenuComponent {
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
	 * Click menu button by name.
	 */
	async clickMenuButton( name: string ): Promise< void > {
		const editorParent = await this.editor.parent();

		const locator = editorParent.getByRole( 'menuitem', { name: name } );
		await locator.waitFor();
		await locator.click();
	}
}
