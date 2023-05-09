import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const parentSelector = '.components-modal__frame';

const selectors = {
	nameInput: `${ parentSelector } input[type="text"]`,
	createButton: `${ parentSelector } button:text("Create")`,
	existingTemplatePart: ( name: string ) =>
		`${ parentSelector } [aria-label="Block Patterns"] [aria-label="${ name }"]`,
};

/**
 * Represents the modal in the full site editor that lets you create or select template parts.
 */
export class TemplatePartModalComponent {
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
	 * Enter a name for a new template part.
	 *
	 * @param {string} name Name for the new template.
	 */
	async enterTemplateName( name: string ): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.nameInput );
		await locator.fill( name );
	}

	/**
	 * Click the create button for a new template part.
	 */
	async clickCreate(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.createButton );
		await locator.click();
	}

	/**
	 * Select an existing template part from the selection modal for insertion.
	 *
	 * @param {string} name Name of the existing template part.
	 */
	async selectExistingTemplatePart( name: string ): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.existingTemplatePart( name ) );
		await locator.click();
	}
}
