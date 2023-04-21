import { Page } from 'playwright';
import { DimensionsSettings, EditorDimensionsComponent } from './editor-dimensions-component';
import {
	ColorSettings,
	EditorColorPickerComponent,
	EditorTypographyComponent,
	EditorWindow,
	TypographySettings,
} from '.';

const parentSelector = '.edit-site-global-styles-sidebar';

const selectors = {
	menuButton: ( buttonName: string ) =>
		`${ parentSelector } button.components-navigator-button:has-text("${ buttonName }")`,
	closeSidebarButton: 'button:visible[aria-label="Close Styles sidebar"]',
	backButton: `${ parentSelector } button[aria-label="Navigate to the previous view"]`,
	moreActionsMenuButton: `${ parentSelector } button[aria-label="More Styles actions"]`,
	styleVariation: ( styleVariationName: string ) =>
		`${ parentSelector } .edit-site-global-styles-variations_item[aria-label="${ styleVariationName }"]`,
};

export type ColorLocation = 'Background' | 'Text' | 'Links';

/**
 * Represents the site editor site styles sidebar/panel.
 */
export class EditorSiteStylesComponent extends EditorWindow {
	private editorColorPickerComponent: EditorColorPickerComponent;
	private editorTypographyComponent: EditorTypographyComponent;
	private editorDimensionsComponent: EditorDimensionsComponent;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		super( page );
		this.editorColorPickerComponent = new EditorColorPickerComponent( page );
		this.editorTypographyComponent = new EditorTypographyComponent( page );
		this.editorDimensionsComponent = new EditorDimensionsComponent( page );
	}

	/**
	 * Checks if the site styles sidebar/panel is open.
	 * Not reliable for immediate validation after an open/close action,
	 * but can be used to determine starting state.
	 *
	 * @returns true if the site styles sidebar/panel is open, false otherwise.
	 */
	async siteStylesIsOpen(): Promise< boolean > {
		const editorFrame = await this.getEditorFrame();
		const locator = editorFrame.locator( parentSelector );
		return ( await locator.count() ) > 0;
	}

	/**
	 * Closes the site styles sidebar/panel.
	 */
	async closeSiteStyles(): Promise< void > {
		if ( await this.siteStylesIsOpen() ) {
			const editorFrame = await this.getEditorFrame();
			const locator = editorFrame.locator( selectors.closeSidebarButton );
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
	 * Sets a style variation for the site.
	 * This auto-handles returning to top menu and navigating down.
	 *
	 * @param {string} styleVariationName The name of the style variation to set.
	 */
	async setStyleVariation( styleVariationName: string ): Promise< void > {
		await this.returnToTopMenu();
		await this.clickMenuButton( 'Browse styles' );
		const editorFrame = await this.getEditorFrame();
		const locator = editorFrame.locator( selectors.styleVariation( styleVariationName ) );
		await locator.click();
	}

	/**
	 * Clicks a menu button in the site styles sidebar/panel.
	 *
	 * @param {string} buttonName Button name.
	 */
	async clickMenuButton( buttonName: string ): Promise< void > {
		const editorFrame = await this.getEditorFrame();
		const locator = editorFrame.locator( selectors.menuButton( buttonName ) );
		await locator.click();
	}

	/**
	 * Returns to the top-level menu in the site styles sidebar/panel.
	 */
	async returnToTopMenu(): Promise< void > {
		const editorFrame = await this.getEditorFrame();
		const backButtonLocator = editorFrame.locator( selectors.backButton );
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
		const editorFrame = await this.getEditorFrame();
		const locator = editorFrame.locator( selectors.moreActionsMenuButton );
		await locator.click();
	}
}
