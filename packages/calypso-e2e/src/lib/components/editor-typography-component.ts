import { Locator, Page } from 'playwright';

type FontSize = 'Small' | 'Medium' | 'Large' | 'Extra Large'; // expand as needed.
type FontAppearance = 'Default' | 'Thin' | 'Regular' | 'Medium'; // expand as needed.

export interface TypographySettings {
	fontSize?: FontSize | number;
	lineHeight?: number;
	letterSpacing?: number;
	appearance?: FontAppearance;
	// Can add other block editor ones later (like drop cap)
}

type EditorContext = 'site' | 'block';

const parentSelector = '[class*="typography"]'; // Support block and site.
const selectors = {
	appearanceDropdownButton: `${ parentSelector } button[aria-label="Appearance"]`,
	appearanceSelection: ( appearance: FontAppearance ) =>
		`${ parentSelector } .components-font-appearance-control [role=option]:text-is("${ appearance }")`,
};

/**
 * Represents a typography settings component (used in blocks and global styles).
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
	 */
	constructor( page: Page, editor: Locator, context: EditorContext ) {
		this.page = page;
		this.editor = editor;
		this.context = context;
	}

	/**
	 *
	 * @param settings
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

		if ( settings.appearance ) {
			await this.setAppearance( settings.appearance );
		}
	}

	/**
	 *
	 * @param appearance
	 */
	private async setAppearance( appearance: FontAppearance ): Promise< void > {
		// In the future, if we're in the block context, we'll probably have to add this field first.

		const dropdownButtonLocator = this.editor.locator( selectors.appearanceDropdownButton );
		await dropdownButtonLocator.click();

		const selectionLocator = this.editor.locator( selectors.appearanceSelection( appearance ) );
		await selectionLocator.click();
	}
}
