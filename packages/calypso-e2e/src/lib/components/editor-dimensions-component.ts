import { Page } from 'playwright';
import { EditorPopoverMenuComponent } from './editor-popover-menu-component';
import { EditorWindow } from './editor-window';

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
export class EditorDimensionsComponent extends EditorWindow {
	// Usually low-level components don't contain other components like this.
	// In this case however, because the popover is always used whereever this component is,
	// and tieing it together at a higher level is kind of messy, it makes sense to add it here.
	private editorPopoverMenuComponent: EditorPopoverMenuComponent;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		super( page );
		this.editorPopoverMenuComponent = new EditorPopoverMenuComponent( page );
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
		const editorFrame = await this.getEditorFrame();
		const optionsButtonLocator = editorFrame.locator( selectors.optionsButton );
		await optionsButtonLocator.click();
		await this.editorPopoverMenuComponent.clickMenuButton( 'Reset all' );
	}

	/**
	 * Sets the padding.
	 *
	 * @param {number} padding Padding dimension to select.
	 */
	private async setPadding( padding: number ): Promise< void > {
		const editorFrame = await this.getEditorFrame();
		await editorFrame.getByLabel( 'All sides padding' ).fill( padding.toString() );
	}
}
