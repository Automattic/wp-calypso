import { Page, Locator } from 'playwright';
import { DimensionsSettings, EditorDimensionsComponent } from './editor-dimensions-component';
import {
	ColorSettings,
	EditorColorPickerComponent,
	EditorTypographyComponent,
	TypographySettings,
} from '.';

const parentSelector = '.edit-site-global-styles-sidebar';

const selectors = {
	menuButton: ( buttonName: string ) =>
		`${ parentSelector } button.components-navigator-button:has-text("${ buttonName }")`,
	closeSidebarButton: 'button[aria-expanded="true"][aria-label="Styles"]',
	backButton: `${ parentSelector } button[aria-label="Navigate to the previous view"]`,
	moreActionsMenuButton: `${ parentSelector } button[aria-label="More Styles actions"]`,
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
	private editorDimensionsComponent: EditorDimensionsComponent;

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
		this.editorTypographyComponent = new EditorTypographyComponent( page, editor, 'site-styles' );
		this.editorDimensionsComponent = new EditorDimensionsComponent( page, editor, 'site-styles' );
	}

	/**
	 * Checks if the site styles sidebar/panel is open.
	 * Not reliable for immediate validation after an open/close action,
	 * but can be used to determine starting state.
	 *
	 * @returns true if the site styles sidebar/panel is open, false otherwise.
	 */
	async siteStylesIsOpen(): Promise< boolean > {
		const locator = this.editor.locator( parentSelector );
		return ( await locator.count() ) > 0;
	}

	/**
	 * Closes the site styles sidebar/panel.
	 */
	async closeSiteStyles(): Promise< void > {
		if ( await this.siteStylesIsOpen() ) {
			const locator = this.editor.locator( selectors.closeSidebarButton );
			await locator.click();
		}
	}

	/**
	 * Sets a color style setting globaly for the site.
	 * This auto-handles returning to top menu and navigating down.
	 *
	 * @param {ColorLocation} colorLocation What part of the site we are updating the color for.
	 * @param {ColorSettings} colorSettings Settings for the color to set.
	 */
	async setGlobalColor(
		colorLocation: ColorLocation,
		colorSettings: ColorSettings
	): Promise< void > {
		await this.returnToTopMenu();
		await this.clickMenuButton( 'Colors' );
		await this.clickMenuButton( colorLocation );
		await this.editorColorPickerComponent.setColor( colorSettings );
	}

	// In future: setBlockColor()

	// In future: setGlobalTypography()

	/**
	 * Sets a typography style for a block.
	 * This auto-handles returning to top menu and navigating down.
	 *
	 * @param {string} blockName Block name (as appears in list).
	 * @param {TypographySettings} typographySettings Typography settings to set.
	 */
	async setBlockTypography(
		blockName: string,
		typographySettings: TypographySettings
	): Promise< void > {
		await this.returnToTopMenu();
		await this.clickMenuButton( 'Blocks' );
		await this.clickMenuButton( blockName );
		await this.clickMenuButton( 'Typography' );
		await this.editorTypographyComponent.setTypography( typographySettings );
	}

	/**
	 * Set global layout settings for the site.
	 * Note that only the "Padding" dimension is available globally.
	 *
	 * @param {DimensionsSettings} settings The dimensions settings to set.
	 */
	async setGlobalLayout( settings: DimensionsSettings ): Promise< void > {
		await this.returnToTopMenu();
		await this.clickMenuButton( 'Layout' );
		await this.editorDimensionsComponent.setDimensions( settings );
	}

	/**
	 * Reset the global layout dimensions.
	 * (To empty layout defaults, not the theme defaults.)
	 */
	async resetGlobalLayout(): Promise< void > {
		await this.returnToTopMenu();
		await this.clickMenuButton( 'Layout' );
		await this.editorDimensionsComponent.resetAll();
	}

	/**
	 * Clicks a menu button in the site styles sidebar/panel.
	 *
	 * @param {string} buttonName Button name.
	 */
	async clickMenuButton( buttonName: string ): Promise< void > {
		const locator = this.editor.locator( selectors.menuButton( buttonName ) );
		await locator.click();
	}

	/**
	 * Returns to the top-level menu in the site styles sidebar/panel.
	 */
	async returnToTopMenu(): Promise< void > {
		const backButtonLocator = this.editor.locator( selectors.backButton );
		// The DOM node of the current active panel is directly replaced on re-render.
		// This means that we can safely rely on "count()" as an indicator of if there's
		// back navigation to do.
		while ( ( await backButtonLocator.count() ) > 0 ) {
			await backButtonLocator.click();
		}
	}

	/**
	 * Open the more actions menu in the site styles sidebar/panel.
	 */
	async openMoreActionsMenu(): Promise< void > {
		const locator = this.editor.locator( selectors.moreActionsMenuButton );
		await locator.click();
	}
}
