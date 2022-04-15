import { Locator, Page } from 'playwright';

const parentSelector = '.block-editor-color-gradient-control__fieldset';

const selectors = {
	colorSwatchButton: ( swatchName: ThemeColorPurposes | DefaultColorNames ) =>
		`${ parentSelector } .components-circular-option-picker__swatches [aria-label="Color: ${ swatchName }"]`,

	colorTypeToggle: ( colorType: ColorType ) =>
		`${ parentSelector } [aria-label="Select color type"] button[aria-label="${ colorType }"]`,

	customColorButton: `${ parentSelector } [aria-label^="Custom color picker"]`,
};

type ColorType = 'Solid' | 'Gradient';

type ThemeColorPurposes = 'Primary' | 'Secondary' | 'Tertiary' | 'Background' | 'Foreground';
type DefaultColorNames = 'Black' | 'White'; // Add as needed.
interface ColorSwatch {
	colorName: DefaultColorNames | ThemeColorPurposes;
}
/**
 * Type guard to determine if a SolidColor is a DefaultSwatch.
 *
 * @param {SolidColor} solidColor The SolidColor configuration settings.
 * @returns Type guard for DefaultSwatch.
 */
function isColorSwatch( solidColor: SolidColor ): solidColor is ColorSwatch {
	return ( solidColor as ColorSwatch ).colorName !== undefined;
}

interface CustomColor {
	hexValue: string;
}
/**
 * Type guard to determine if a SolidColor is a CustomColor.
 *
 * @param {SolidColor} solidColor The SolidColor configuration settings.
 * @returns Type guard for CustomColor.
 */
function isCustomColor( solidColor: SolidColor ): solidColor is CustomColor {
	return ( solidColor as CustomColor ).hexValue !== undefined;
}

type SolidColor = ColorSwatch | CustomColor;
/**
 *
 * @param colorSettings
 * @returns
 */
function isSolidColor( colorSettings: ColorSettings ): colorSettings is SolidColor {
	return (
		isColorSwatch( colorSettings as SolidColor ) || isCustomColor( colorSettings as SolidColor )
	);
}

type GradientColor = 'NOT IMPLEMENTED';

export type ColorSettings = SolidColor | GradientColor;

/**
 * Represents a color picker in the editor (used in blocks and global styles).
 */
export class EditorColorPickerComponent {
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
	 * @param colorSettings
	 */
	async setColor( colorSettings: ColorSettings ): Promise< void > {
		if ( isSolidColor( colorSettings ) ) {
			await this.setSolidColor( colorSettings );
		} else {
			throw new Error( 'Gradient colors are not implemented yet.' );
		}
	}

	/**
	 *
	 * @param colorSettings
	 */
	private async setSolidColor( colorSettings: SolidColor ): Promise< void > {
		if ( await this.colorTypeToggleIsAvailable() ) {
			await this.toggleColorType( 'Solid' );
		}
		// If the toggle is not available, it's only solid colors anyway -- we can proceed!

		if ( isCustomColor( colorSettings ) ) {
			throw new Error( 'Custom colors have not been implemented yet.' );
		}

		if ( isColorSwatch( colorSettings ) ) {
			const swatchLocator = this.editor.locator(
				selectors.colorSwatchButton( colorSettings.colorName )
			);
			await swatchLocator.click();
		}
	}

	/**
	 *
	 * @param colorType
	 */
	private async toggleColorType( colorType: ColorType ): Promise< void > {
		const locator = this.editor.locator( selectors.colorTypeToggle( colorType ) );
		await locator.click();
	}

	/**
	 *
	 * @returns
	 */
	private async colorTypeToggleIsAvailable(): Promise< boolean > {
		const customColorLocator = this.editor.locator( selectors.customColorButton );
		await customColorLocator.waitFor();

		const toggleLocator = this.editor.locator( selectors.colorTypeToggle( 'Solid' ) );
		return ( await toggleLocator.count() ) > 0;
	}
}
