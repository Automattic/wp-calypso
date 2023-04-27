import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const parentSelector = '.block-editor-color-gradient-control__fieldset';
const selectors = {
	colorSwatchButton: ( swatchName: ThemeColorPurposes | DefaultColorNames ) =>
		`${ parentSelector } .components-circular-option-picker__swatches [aria-label="Color: ${ swatchName }"]`,

	colorTypeToggle: ( colorType: ColorType ) =>
		`${ parentSelector } [aria-label="Select color type"] button[aria-label="${ colorType }"]`,

	customColorButton: `${ parentSelector } [aria-label^="Custom color picker"]`,
};

type ColorType = 'Solid' | 'Gradient';

// Color settings types.

type ThemeColorPurposes = 'Primary' | 'Secondary' | 'Tertiary' | 'Background' | 'Foreground';
type DefaultColorNames = 'Black' | 'White'; // Add as needed.
interface ColorSwatch {
	colorName: DefaultColorNames | ThemeColorPurposes;
}
interface CustomColor {
	hexValue: string;
}
type SolidColor = ColorSwatch | CustomColor;

type GradientColor = 'NOT IMPLEMENTED';

export type ColorSettings = SolidColor | GradientColor;

// Type guards to determine what type of color settings were provided.

/**
 * Type guard to determine if a SolidColor is a ColorSwatch.
 *
 * @param {SolidColor} solidColor The SolidColor configuration settings.
 * @returns Type guard for ColorSwatch.
 */
function isColorSwatch( solidColor: SolidColor ): solidColor is ColorSwatch {
	return ( solidColor as ColorSwatch ).colorName !== undefined;
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

/**
 * Type guard to determine if a ColorSettings is a SolidColor.
 *
 * @param {ColorSettings} colorSettings
 * @returns Type guard for SolidColor.
 */
function isSolidColor( colorSettings: ColorSettings ): colorSettings is SolidColor {
	return (
		isColorSwatch( colorSettings as SolidColor ) || isCustomColor( colorSettings as SolidColor )
	);
}

/**
 * Represents a color picker in the editor (used in blocks and site styles).
 */
export class EditorColorPickerComponent {
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
	 * Set a color in the color picker.
	 *
	 * @param {ColorSettings} colorSettings Settings for the color to set.
	 */
	async setColor( colorSettings: ColorSettings ): Promise< void > {
		if ( isSolidColor( colorSettings ) ) {
			await this.setSolidColor( colorSettings );
		} else {
			throw new Error( 'Gradient colors are not implemented yet.' );
		}
	}

	/**
	 * Sets a solid color value.
	 *
	 * @param {SolidColor} colorSettings
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
			const editorParent = await this.editor.parent();
			const swatchLocator = editorParent.locator(
				selectors.colorSwatchButton( colorSettings.colorName )
			);
			await swatchLocator.click();
		}
	}

	/**
	 * Clicks the toggle button for color type ('Solid' or 'Gradient')
	 *
	 * @param {ColorType} colorType
	 */
	private async toggleColorType( colorType: ColorType ): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.colorTypeToggle( colorType ) );
		await locator.click();
	}

	/**
	 * Checks if the component has a color type toggle. (If it doesn't, only solid is supported.)
	 *
	 * @returns true if the color type toggle is there, false otherwise.
	 */
	private async colorTypeToggleIsAvailable(): Promise< boolean > {
		const editorParent = await this.editor.parent();
		// Due to async loading, we need something that IS always there to key off of.
		// The custom color picker is always there! We can reliably wait for it.
		const customColorLocator = editorParent.locator( selectors.customColorButton );
		await customColorLocator.waitFor();

		// Now we know the component has fully loaded, we can check for the toggle's presence.
		const toggleLocator = editorParent.locator( selectors.colorTypeToggle( 'Solid' ) );
		return ( await toggleLocator.count() ) > 0;
	}
}
