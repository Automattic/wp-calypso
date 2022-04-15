import { Page, Locator } from 'playwright';
import {
	ColorSettings,
	EditorColorPickerComponent,
	EditorTypographyComponent,
	TypographySettings,
} from '.';

const parentSelector = '.edit-site-global-styles-sidebar';

const selectors = {
	navigationButton: ( buttonName: string ) =>
		`${ parentSelector } button.components-navigator-button:has-text("${ buttonName }")`,
	closeSidebarButton: 'button[aria-label="Close global styles sidebar"]',
	backButton: `${ parentSelector } button[aria-label="Navigate to the previous view"]`,
};

export type ColorLocation = 'Background' | 'Text' | 'Links';

/**
 * Represents the site editor site styles sidebar/panel.
 */
export class EditorSiteStylesComponent {
	private page: Page;
	private editor: Locator;

	private editorColorPickerComponent: EditorColorPickerComponent;
	private editorTypographyComponent: EditorTypographyComponent;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} editor Frame-safe locator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;

		this.editorColorPickerComponent = new EditorColorPickerComponent( page, editor );
		this.editorTypographyComponent = new EditorTypographyComponent( page, editor, 'site' );
	}

	/**
	 * Click menu button by name.
	 */
	async siteStylesIsOpen(): Promise< boolean > {
		const locator = this.editor.locator( parentSelector );
		return ( await locator.count() ) > 0;
	}

	/**
	 *
	 */
	async closeSiteStyles(): Promise< void > {
		if ( await this.siteStylesIsOpen() ) {
			const locator = this.editor.locator( selectors.closeSidebarButton );
			await locator.click();
		}
	}

	/**
	 *
	 * @param colorLocation
	 * @param colorSettings
	 */
	async setGlobalColor(
		colorLocation: ColorLocation,
		colorSettings: ColorSettings
	): Promise< void > {
		await this.returnToTopMenu();
		await this.clickNavigationButton( 'Colors' );
		await this.clickNavigationButton( colorLocation );
		await this.editorColorPickerComponent.setColor( colorSettings );
	}

	// In future: setBlockColor()

	// In future: setGlobalTypography()

	/**
	 *
	 * @param blockName
	 * @param typographySettings
	 */
	async setBlockTypography(
		blockName: string,
		typographySettings: TypographySettings
	): Promise< void > {
		await this.returnToTopMenu();
		await this.clickNavigationButton( 'Blocks' );
		await this.clickNavigationButton( blockName );
		await this.clickNavigationButton( 'Typography' );
		await this.editorTypographyComponent.setTypography( typographySettings );
	}

	/**
	 *
	 * @param buttonName
	 */
	private async clickNavigationButton( buttonName: string ): Promise< void > {
		const locator = this.editor.locator( selectors.navigationButton( buttonName ) );
		await locator.click();
	}

	/**
	 *
	 */
	private async returnToTopMenu(): Promise< void > {
		const backButtonLocator = this.editor.locator( selectors.backButton );
		while ( ( await backButtonLocator.count() ) > 0 ) {
			await backButtonLocator.click();
		}
	}
}
