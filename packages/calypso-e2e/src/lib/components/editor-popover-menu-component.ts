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
	 * Click menu button by name. Matches plain menu items as well as toggleable
	 * variants (menuitemcheckbox / menuitemradio) used by current Gutenberg for
	 * panel toggles like "Styles".
	 */
	async clickMenuButton( name: string ): Promise< void > {
		const editorParent = await this.editor.parent();

		const item = editorParent.getByRole( 'menuitem', { name } );
		const checkboxItem = editorParent.getByRole( 'menuitemcheckbox', { name } );
		const radioItem = editorParent.getByRole( 'menuitemradio', { name } );
		const locator = item.or( checkboxItem ).or( radioItem ).first();
		await locator.waitFor();
		await locator.click();
	}
}
