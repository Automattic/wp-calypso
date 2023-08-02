import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

type FontSize = 'Small' | 'Medium' | 'Large' | 'Extra Large'; // expand as needed.
type FontAppearance = 'Default' | 'Thin' | 'Regular' | 'Medium'; // expand as needed.

export interface TypographySettings {
	fontSize?: FontSize | number;
	lineHeight?: number;
	letterSpacing?: number;
	fontAppearance?: FontAppearance;
	// Can add other block editor specific ones later (like drop cap)
}

/**
 * Represents a typography settings component (used in blocks and site styles).
 */
export class EditorTypographyComponent {
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
	 * Set typography settings.
	 *
	 * @param {TypographySettings} settings Settings to set. Only properties provided will be set.
	 */
	async setTypography( settings: TypographySettings ): Promise< void > {
		if ( settings.fontSize ) {
			throw new Error( 'Font size is not yet implemented.' );
		}

		if ( settings.lineHeight ) {
			throw new Error( 'Font size is not yet implemented.' );
		}

		if ( settings.letterSpacing ) {
			throw new Error( 'Font size is not yet implemented.' );
		}

		if ( settings.fontAppearance ) {
			await this.setAppearance( settings.fontAppearance );
		}
	}

	/**
	 * Sets the typography font appearance.
	 *
	 * @param {FontAppearance} fontAppearance Font appearance to select.
	 */
	private async setAppearance( fontAppearance: FontAppearance ): Promise< void > {
		const editorParent = await this.editor.parent();
		// In the future, if we're in the block context, we'll have to add this field first.
		const dropdownButtonLocator = editorParent.getByRole( 'button', {
			name: 'Appearance',
			exact: true,
		} );
		await dropdownButtonLocator.click();

		const selectionLocator = editorParent.getByRole( 'option', {
			name: fontAppearance,
			exact: true,
		} );
		await selectionLocator.click();
	}
}
