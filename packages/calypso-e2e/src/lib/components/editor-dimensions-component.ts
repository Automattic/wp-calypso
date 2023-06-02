import { Page } from 'playwright';
import { EditorComponent } from './editor-component';
import { EditorPopoverMenuComponent } from './editor-popover-menu-component';

const selectors = {
	paddingInput: 'input[aria-label="Padding"]',
	optionsButton: 'button[aria-label="Dimensions options"]',
};

export interface DimensionsSettings {
	padding?: number;
	margin?: number;
}

/**
 * Represents a dimenstions settings component (used in blocks and site styles).
 */
export class EditorDimensionsComponent {
	private page: Page;
	private editor: EditorComponent;

	// Usually low-level components don't contain other components like this.
	// In this case however, because the popover is always used whereever this component is,
	// and tieing it together at a higher level is kind of messy, it makes sense to add it here.
	private editorPopoverMenuComponent: EditorPopoverMenuComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorComponent} editor The EditorComponent instance.
	 */
	constructor( page: Page, editor: EditorComponent ) {
		this.page = page;
		this.editor = editor;
		this.editorPopoverMenuComponent = new EditorPopoverMenuComponent( page, editor );
	}

	/**
	 * Set dimension settings.
	 *
	 * @param {DimensionsSettings} settings Settings to set. Only properties provided will be set.
	 */
	async setDimensions( settings: DimensionsSettings ): Promise< void > {
		if ( settings.margin !== undefined ) {
			throw new Error( 'Margin is not yet implemented.' );
		}

		if ( settings.padding !== undefined ) {
			await this.setPadding( settings.padding );
		}
	}

	/**
	 * Reset all of the dimension settings.
	 */
	async resetAll(): Promise< void > {
		const editorParent = await this.editor.parent();
		const optionsButtonLocator = editorParent.locator( selectors.optionsButton );
		await optionsButtonLocator.click();
		await this.editorPopoverMenuComponent.clickMenuButton( 'Reset all' );
	}

	/**
	 * Sets the padding.
	 *
	 * @param {number} padding Padding dimension to select.
	 */
	private async setPadding( padding: number ): Promise< void > {
		const editorParent = await this.editor.parent();
		await editorParent.getByLabel( 'All sides padding' ).fill( padding.toString() );
	}
}
