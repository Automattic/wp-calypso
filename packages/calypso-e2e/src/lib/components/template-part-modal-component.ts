import { Locator, Page } from 'playwright';

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
	private editor: Locator;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} editor Frame-safe locator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 *
	 * @param name
	 */
	async enterTemplateName( name: string ): Promise< void > {
		const locator = this.editor.locator( selectors.nameInput );
		await locator.fill( name );
	}

	/**
	 *
	 */
	async clickCreate(): Promise< void > {
		const locator = this.editor.locator( selectors.createButton );
		await locator.click();
	}

	/**
	 *
	 * @param name
	 */
	async selectExistingTemplatePart( name: string ): Promise< void > {
		const locator = this.editor.locator( selectors.existingTemplatePart( name ) );
		await locator.click();
	}
}
