import { Locator, Page } from 'playwright';

type FontSize = 'Small' | 'Medium' | 'Large' | 'Extra Large'; // expand as needed.
type FontAppearance = 'Default' | 'Thin' | 'Regular' | 'Medium'; // expand as needed.

export interface TypographySettings {
	fontSize?: FontSize | number;
	lineHeight?: number;
	letterSpacing?: number;
	fontAppearance?: FontAppearance;
	// Can add other block editor specific ones later (like drop cap)
}

type EditorContext = 'site-styles' | 'block';

/**
 * Represents a typography settings component (used in blocks and site styles).
 */
export class EditorTypographyComponent {
	private page: Page;
	private editor: Locator;
	private context: EditorContext;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} editor Frame-safe locator to the editor.
	 * @param {EditorContext} context Whether we're in global styles or a block.
	 */
	constructor( page: Page, editor: Locator, context: EditorContext ) {
		this.page = page;
		this.editor = editor;
		this.context = context;
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
		// In the future, if we're in the block context, we'll have to add this field first.

		const dropdownButtonLocator = this.editor.getByRole( 'button', {
			name: 'Appearance',
			exact: true,
		} );
		await dropdownButtonLocator.click();

		const selectionLocator = this.editor.getByRole( 'option', {
			name: fontAppearance,
			exact: true,
		} );
		await selectionLocator.click();
	}
}
