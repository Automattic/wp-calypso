import assert from 'assert';
import { Locator, Page } from 'playwright';
import {
	BlockInserter,
	EditorSidebarBlockInserterComponent,
	EditorToolbarComponent,
	EditorWelcomeTourComponent,
	EditorPopoverMenuComponent,
	EditorSiteStylesComponent,
	ColorSettings,
	TypographySettings,
	ColorLocation,
	FullSiteEditorSavePanelComponent,
	EditorBlockToolbarComponent,
	BlockToolbarButtonIdentifier,
	TemplatePartListComponent,
	FullSiteEditorNavSidebarComponent,
	FullSiteEditorDataViewsComponent,
	TemplatePartModalComponent,
	OpenInlineInserter,
	EditorInlineBlockInserterComponent,
	DimensionsSettings,
	CookieBannerComponent,
	EditorComponent,
} from '..';
import { getIdFromBlock } from '../../element-helper';
import envVariables from '../../env-variables';

const selectors = {
	editorRoot: 'body.block-editor-page',
	editorCanvasIframe: 'iframe[name="editor-canvas"]',
	editorCanvasRoot: 'body.block-editor-iframe__body',
	templateLoadingSpinner: '[aria-label="Block: Template Part"] .components-spinner',
	closeStylesWelcomeGuideButton:
		'[aria-label="Welcome to styles"] button[aria-label="Close dialog"]',
	limitedGlobalStylesModalTryButton: '.wpcom-global-styles-modal__actions button:first-child',
	// The toast can have double quotes, so we use single quotes here.
	confirmationToast: ( text: string ) => `.components-snackbar:has-text('${ text }')`,
	focusedBlock: ( blockSelector: string ) => `${ blockSelector }.is-selected`,
	parentOfFocusedBlock: ( blockSelector: string ) => `${ blockSelector }.has-child-selected`,
	limitedGlobalStylesNotice: '.wpcom-global-styles-notice',
};

/**
 * Represents an instance of the FSE site editor.
 * This class is composed of editor components, combining them into larger flows.
 */
export class FullSiteEditorPage {
	private page: Page;
	private editor: EditorComponent;
	private editorToolbarComponent: EditorToolbarComponent;
	private editorSidebarBlockInserterComponent: EditorSidebarBlockInserterComponent;
	private editorInlineBlockInserterComponent: EditorInlineBlockInserterComponent;
	private editorWelcomeTourComponent: EditorWelcomeTourComponent;
	private editorPopoverMenuComponent: EditorPopoverMenuComponent;
	private editorSiteStylesComponent: EditorSiteStylesComponent;
	private editorBlockToolbarComponent: EditorBlockToolbarComponent;
	private fullSiteEditorSavePanelComponent: FullSiteEditorSavePanelComponent;
	private fullSiteEditorNavSidebarComponent: FullSiteEditorNavSidebarComponent;
	private fullSiteEditorDataViewsComponent: FullSiteEditorDataViewsComponent;
	private templatePartModalComponent: TemplatePartModalComponent;
	private templatePartListComponent: TemplatePartListComponent;
	private cookieBannerComponent: CookieBannerComponent;

	/**
	 * Constructs an instance of the page POM class.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;

		this.editor = new EditorComponent( page );

		this.editorToolbarComponent = new EditorToolbarComponent( page, this.editor );
		this.editorWelcomeTourComponent = new EditorWelcomeTourComponent( page, this.editor );
		this.editorPopoverMenuComponent = new EditorPopoverMenuComponent( page, this.editor );
		this.editorSiteStylesComponent = new EditorSiteStylesComponent( page, this.editor );
		this.editorBlockToolbarComponent = new EditorBlockToolbarComponent( page, this.editor );
		this.fullSiteEditorNavSidebarComponent = new FullSiteEditorNavSidebarComponent(
			page,
			this.editor
		);
		this.fullSiteEditorDataViewsComponent = new FullSiteEditorDataViewsComponent(
			page,
			this.editor
		);
		this.editorSidebarBlockInserterComponent = new EditorSidebarBlockInserterComponent(
			page,
			this.editor
		);
		this.editorInlineBlockInserterComponent = new EditorInlineBlockInserterComponent(
			page,
			this.editor
		);
		this.fullSiteEditorSavePanelComponent = new FullSiteEditorSavePanelComponent(
			page,
			this.editor
		);
		this.templatePartModalComponent = new TemplatePartModalComponent( page, this.editor );
		this.templatePartListComponent = new TemplatePartListComponent( page, this.editor );
		this.cookieBannerComponent = new CookieBannerComponent( page, this.editor );
	}

	//#region Visit and Setup

	/**
	 * Visit the site editor by URL directly.
	 *
	 * @param {string} siteHostWithProtocol Host name of the site, with protocol. (e.g. https://testsite.wordpress.com)
	 */
	async visit( siteHostWithProtocol: string ): Promise< void > {
		let parsedUrl: URL;
		try {
			parsedUrl = new URL( siteHostWithProtocol );
		} catch ( error ) {
			throw new Error(
				`Invalid site host URL provided: "${ siteHostWithProtocol }". Did you remember to include the protocol?`
			);
		}

		parsedUrl.pathname = '/wp-admin/site-editor.php';
		parsedUrl.searchParams.set( 'calypso_origin', envVariables.CALYPSO_BASE_URL );

		await this.page.goto( parsedUrl.href, { timeout: 60 * 1000 } );
	}

	/**
	 * Waits until the site editor is fully loaded.
	 */
	async waitUntilLoaded(): Promise< void > {
		const editorCanvas = await this.editor.canvas();
		// But then, template parts load async afterwards!
		const spinnerLocator = editorCanvas.locator( selectors.templateLoadingSpinner );
		// There could be many spinners, so we will keep waiting for the first to be detached.
		await spinnerLocator.first().waitFor( { state: 'detached' } );
	}

	/**
	 * Does all waiting and initial actions to prepare the site editor for interaction.
	 *
	 * @param {Object} param0 Keyed object of options.
	 * @param {boolean} param0.leaveWithoutSaving Set if we should auto-except dialog about unsaved changes when leaving.
	 */
	async prepareForInteraction(
		{
			leaveWithoutSaving,
		}: {
			leaveWithoutSaving?: boolean;
		} = { leaveWithoutSaving: true }
	): Promise< void > {
		// On mobile, we don't load the canvas right away, just the sidebar. So we don't need to wait for the canvas at this point.
		if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
			await this.waitUntilLoaded();
		}

		await this.editorWelcomeTourComponent.forceDismissWelcomeTour();
		await this.cookieBannerComponent.acceptCookie();

		if ( leaveWithoutSaving ) {
			this.page.on( 'dialog', async ( dialog ) => {
				if ( dialog.type() === 'beforeunload' ) {
					await dialog.accept();
				}
			} );
		}
	}

	/**
	 * Clicks on a button with the exact name.
	 */
	async clickFullSiteNavigatorButton( text: string ): Promise< void > {
		await this.fullSiteEditorNavSidebarComponent.clickNavButtonByExactText( text );
	}

	/**
	 * Clicks DataViews primary field to open editor.
	 */
	async openTemplateEditor( text: string ): Promise< void > {
		await this.fullSiteEditorDataViewsComponent.clickPrimaryFieldByExactText( text );
	}

	/**
	 * Ensures the nav sidebar is at the top level ("Design")
	 */
	async ensureNavigationTopLevel(): Promise< void > {
		await this.fullSiteEditorNavSidebarComponent.ensureNavigationTopLevel();
	}

	//#endregion

	//#region Block Actions

	/**
	 * Adds a Gutenberg block from the sidebar block inserter panel.
	 *
	 * The name is expected to be formatted in the same manner as it
	 * appears on the label when visible in the block inserter panel.
	 *
	 * Example:
	 * 		- Click to Tweet
	 * 		- Pay with Paypal
	 * 		- SyntaxHighlighter Code
	 *
	 * @param {string} blockName Name of the block to be inserted.
	 * @param {string} blockEditorSelector Selector to find the top-level element of the added block in the editor.
	 * @throws If the provided selector does not locate the added block correctly.
	 * @returns A frame-safe locator to the top of the block.
	 */
	async addBlockFromSidebar( blockName: string, blockEditorSelector: string ): Promise< Locator > {
		await this.editorToolbarComponent.openBlockInserter();
		await this.addBlockFromInserter( blockName, this.editorSidebarBlockInserterComponent );
		const addedBlockId = await this.getIdOfAddedBlock( blockEditorSelector );

		// Dismiss the block inserter if viewport is larger than mobile to
		// ensure no interference from the block inserter in subsequent actions on the editor.
		// In mobile, the block inserter will auto-close.
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await this.editorToolbarComponent.closeBlockInserter();
		}

		const editorCanvas = await this.editor.canvas();
		return editorCanvas.locator( `#${ addedBlockId }` );
	}

	/**
	 * Adds a Gutenberg block from the inline block inserter.
	 *
	 * Because there are so many different ways to open the inline inserter, this function accepts a function to run first
	 * that should open the inserter. This allows specs to get to the inserter in the way they need.
	 *
	 * The block name is expected to be formatted in the same manner as it
	 * appears on the label when visible in the block inserter panel.
	 *
	 * Example:
	 * 		- Click to Tweet
	 * 		- Pay with Paypal
	 * 		- SyntaxHighlighter Code
	 *
	 * The block editor selector should select the top level element of a block in the editor.
	 * For reference, this element will almost always have the ".wp-block" class.
	 * We recommend using the aria-label for the selector, e.g. '[aria-label="Block: Quote"]'.
	 *
	 * @param {string} blockName Name of the block as in inserter results.
	 * @param {string} blockEditorSelector Selector to find the block once added.
	 * @param {OpenInlineInserter} openInlineInserter Function to open the inline inserter.
	 * @throws If the provided selector does not locate the added block correctly.
	 * @returns A frame-safe locator to the top of the block.
	 */
	async addBlockInline(
		blockName: string,
		blockEditorSelector: string,
		openInlineInserter: OpenInlineInserter
	): Promise< Locator > {
		// First, launch the inline inserter in the way expected by the script.
		await openInlineInserter( await this.editor.canvas() ); // This needed button is almost always NOT in the canvas iframe.
		await this.addBlockFromInserter( blockName, this.editorInlineBlockInserterComponent );
		const addedBlockId = await this.getIdOfAddedBlock( blockEditorSelector );
		const editorCanvas = await this.editor.canvas();
		return editorCanvas.locator( `#${ addedBlockId }` );
	}

	/**
	 * Shared submethod to insert a block from a block inserter.
	 *
	 * @param {string} blockName Name of the block.
	 * @param {BlockInserter} inserter A block inserter component.
	 */
	private async addBlockFromInserter(
		blockName: string,
		inserter: BlockInserter
	): Promise< void > {
		await inserter.searchBlockInserter( blockName );
		await inserter.selectBlockInserterResult( blockName );
	}

	/**
	 * Shared submethod to wait for a just-added block and get its block ID.
	 * The ID is the most reliable way to identify the block over time.
	 *
	 * @param {string} blockEditorSelector Selector to find the block once added.
	 * @returns The ID of the recently added block.
	 */
	private async getIdOfAddedBlock( blockEditorSelector: string ): Promise< string > {
		const editorCanvas = await this.editor.canvas();
		// The added block will always either be focused, or will be the parent of a focused block.
		const addedBlockLocator = editorCanvas.locator(
			`${ selectors.focusedBlock( blockEditorSelector ) },${ selectors.parentOfFocusedBlock(
				blockEditorSelector
			) }`
		);
		await addedBlockLocator.waitFor();

		return await getIdFromBlock( addedBlockLocator );
	}

	// TODO: Add this to the Gutenberg component to make it re-usable across editors!
	/**
	 * Focus (select in a way that gives block-specific features) a block in the site editor.
	 *
	 * @param {string} blockSelector A selector that uniquely identifies this block in the editor.
	 */
	async focusBlock( blockSelector: string ): Promise< void >;
	/**
	 * Focus (select in a way that gives block-specific features) a block in the site edito
	 *
	 * @param {Locator} blockLocator The locator to the parent block element.
	 */
	async focusBlock( blockLocator: Locator ): Promise< void >;
	/**
	 * Focus (select in a way that gives block-specific features) a block in the site editor.
	 * This is the overload implementation.
	 *
	 * @param {string|Locator} block A way to locate the block (Locator or selector).
	 */
	async focusBlock( block: string | Locator ): Promise< void > {
		const editorCanvas = await this.editor.canvas();
		let originalBlockLocator: Locator;
		let focusedBlockLocator: Locator;
		if ( typeof block === 'string' ) {
			// It's a selector.
			originalBlockLocator = editorCanvas.locator( block );
			focusedBlockLocator = editorCanvas.locator( selectors.focusedBlock( block ) );
		} else {
			// It's a Locator.
			originalBlockLocator = block; // We can just re-use the Locator.
			// For the focused Locator, we have to append a class. We can't do this with a Locator.
			// So, we need to find the block's ID to use to create a focused locator.
			const blockId = await getIdFromBlock( block );
			focusedBlockLocator = editorCanvas.locator( selectors.focusedBlock( `#${ blockId }` ) );
		}

		// Some blocks are buried within parent blocks that may eat the first click.
		// Sending up to three clicks should be enough.
		for ( let clickAttempt = 1; clickAttempt <= 3; clickAttempt++ ) {
			if ( ( await focusedBlockLocator.count() ) > 0 ) {
				return;
			}
			// TODO -- we could check at this point if we've done the opposite here and selected
			// a child block, and if so click the parent button the toolbar!
			await originalBlockLocator.click();
		}
		// Do one last wait to let any async re-renders go through.
		await focusedBlockLocator.waitFor();
	}

	/**
	 * Click a primary (not buried under a dropdown) button on the block toolbar.
	 *
	 * @param {BlockToolbarButtonIdentifier} indentifier A way to identify the button.
	 */
	async clickBlockToolbarPrimaryButton(
		indentifier: BlockToolbarButtonIdentifier
	): Promise< void > {
		await this.editorBlockToolbarComponent.clickPrimaryButton( indentifier );
	}

	/**
	 * Click an option button (under the three-dots popover menu) on the block toolbar.
	 *
	 * @param {string} optionName The name of the option in the popover menu.
	 */
	async clickBlockToolbarOption( optionName: string ): Promise< void > {
		await this.editorBlockToolbarComponent.clickOptionsButton();
		await this.editorPopoverMenuComponent.clickMenuButton( optionName );
	}

	//#endregion

	//#region Toolbar Actions

	/**
	 * Click the editor undo button.
	 */
	async undo(): Promise< void > {
		await this.editorToolbarComponent.undo();
	}

	/**
	 * Click the editor redo button.
	 */
	async redo(): Promise< void > {
		await this.editorToolbarComponent.redo();
	}

	/**
	 * Save the changes in the full site editor (equivalent of publish).
	 */
	async save(): Promise< void > {
		await this.clearExistingSaveConfirmationToast();
		await this.editorToolbarComponent.saveSiteEditor();
		await this.fullSiteEditorSavePanelComponent.confirmSave();
		await this.waitForConfirmationToast( 'Site updated.' );
	}

	/**
	 * Open the navigation sidebar.
	 */
	async openNavSidebar(): Promise< void > {
		const editorParent = await this.editor.parent();
		const openButton = editorParent.locator( 'a[aria-label="Open Navigation"]' );

		await openButton.click();
	}

	/**
	 * Close the navigation sidebar. To do this, you actually just click on the editor canvas! This only works on desktop.
	 * On mobile, there is not standardized way to close the sidebar.
	 */
	async closeNavSidebar(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			throw new Error(
				'There is no standardized way to close the site editor navigation sidebar on mobile. Navigate to a template or template part instead.'
			);
		}
		const editorParent = await this.editor.parent();
		const editorCanvas = await this.editor.canvas();
		const openButton = editorParent.locator( 'a[aria-label="Open Navigation"]' );

		await Promise.race( [ openButton.waitFor(), editorCanvas.locator( 'body' ).click() ] );
	}

	/**
	 * Click the editor document actions icon.
	 */
	async openDocumentActionsDropdown(): Promise< void > {
		await this.editorToolbarComponent.clickDocumentActionsIcon();
	}

	/**
	 * Click on an item in the document actions dropdown.
	 */
	async clickDocumentActionsDropdownItem( itemSelector: string ): Promise< void > {
		await this.editorToolbarComponent.clickDocumentActionsDropdownItem( itemSelector );
	}

	/**
	 * Click the editor document actions icon.
	 */

	//#endregion

	//#region Site Global Styles

	/**
	 * Opens the site styles sidebar in the site editor.
	 *
	 * @param {Object} param0 Keyed options parameter.
	 * @param {boolean} param0.closeWelcomeGuide Set if should close welcome guide on opening.
	 */
	async openSiteStyles(
		{ closeWelcomeGuide }: { closeWelcomeGuide: boolean } = { closeWelcomeGuide: true }
	): Promise< void > {
		if ( ! ( await this.editorSiteStylesComponent.siteStylesIsOpen() ) ) {
			await this.editorToolbarComponent.openMoreOptionsMenu();

			if ( closeWelcomeGuide ) {
				// The unawaited promise and no-op catch are both intentional here!
				// We want to close the welcome guide if it opens, but not slow down the test if it doesn't.
				// This will effectively register a handler that waits for the welcome guide to close it if it appears
				// but otherwise doesn't affect the following actions.
				const safelyWatchForWelcomeGuide = () =>
					this.closeStylesWelcomeGuide().catch( () => {
						// No-op
					} );
				safelyWatchForWelcomeGuide();
			}
			await this.editorPopoverMenuComponent.clickMenuButton( 'Styles' );
		}
	}

	/**
	 * Closes the site styles welcome guide.
	 */
	private async closeStylesWelcomeGuide(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.closeStylesWelcomeGuideButton );
		await locator.click( { timeout: 5 * 1000 } );
	}

	/**
	 * Close the site styles sidebar/panel.
	 */
	async closeSiteStyles(): Promise< void > {
		await this.editorSiteStylesComponent.closeSiteStyles();
	}

	/**
	 * Clicks a navigation menu item/button in the site styles sidebar/panel.
	 *
	 * @param {string} buttonName Name on the menu item/button.
	 */
	async clickStylesMenuButton( buttonName: string ): Promise< void > {
		await this.editorSiteStylesComponent.clickMenuButton( buttonName );
	}

	/**
	 * Returns to the top menu level of the styles sidebar/panel.
	 */
	async returnToStylesTopMenu(): Promise< void > {
		await this.editorSiteStylesComponent.returnToTopMenu();
	}

	/**
	 * Sets a color style setting globaly for the site.
	 * This auto-handles returning to top menu and navigating down.
	 *
	 * @param {ColorLocation} colorLocation What part of the site we are updating the color for.
	 * @param {ColorSettings} colorSettings Settings for the color to set.
	 */
	async setGlobalColorStyle(
		colorLocation: ColorLocation,
		colorSettings: ColorSettings
	): Promise< void > {
		await this.editorSiteStylesComponent.setGlobalColor( colorLocation, colorSettings );
	}

	/**
	 * Sets a typography style for a block.
	 * This auto-handles returning to top menu and navigating down.
	 *
	 * @param {string} blockName Block name (as appears in list).
	 * @param {TypographySettings} typographySettings Typography settings to set.
	 */
	async setBlockTypographyStyle(
		blockName: string,
		typographySettings: TypographySettings
	): Promise< void > {
		await this.editorSiteStylesComponent.setBlockTypography( blockName, typographySettings );
	}

	/**
	 * Set global layout settings for the site.
	 * Note that only the "Padding" dimension is available globally.
	 * This auto-handles returning to top menu and navigating down.
	 *
	 * @param {DimensionsSettings} dimensionsSettings The dimensions settings to set.
	 */
	async setGlobalLayoutStyle( dimensionsSettings: DimensionsSettings ): Promise< void > {
		await this.editorSiteStylesComponent.setGlobalLayout( dimensionsSettings );
	}

	/**
	 * Resets the global layout style to the layout defaults (empty).
	 */
	async resetGlobalLayoutStyle(): Promise< void > {
		await this.editorSiteStylesComponent.resetGlobalLayout();
	}

	/**
	 * Resets the site styles to the defaults for the theme.
	 */
	async resetStylesToDefaults(): Promise< void > {
		await this.editorSiteStylesComponent.openMoreActionsMenu();
		await this.editorPopoverMenuComponent.clickMenuButton( 'Reset to defaults' );
	}

	/**
	 * Selects the "Try it out" option on the Limited Global Styles upgrade modal.
	 */
	async tryGlobalStyles(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.limitedGlobalStylesModalTryButton );
		await locator.click();
	}

	/**
	 * Sets a style variation for the site.
	 * This auto-handles returning to top menu and navigating down.
	 *
	 * @param {string} styleVariationName The name of the style variation to set.
	 */
	async setStyleVariation( styleVariationName: string ): Promise< void > {
		await this.fullSiteEditorNavSidebarComponent.setStyleVariation( styleVariationName );
		const hasCustomStyles = styleVariationName !== 'Default';
		const editorParent = await this.editor.parent();
		const limitedGlobalStylesNotice = editorParent.locator( selectors.limitedGlobalStylesNotice );
		if ( hasCustomStyles ) {
			await limitedGlobalStylesNotice.waitFor();
		} else {
			const count = await limitedGlobalStylesNotice.count();
			assert.equal( count, 0 );
		}
	}

	//#endregion

	//#region Template Parts

	/**
	 * Names and creates a template part from the creation modal.
	 * Because that modal can come from a variety of flows,
	 * this method assumes you have launched the modal first.
	 *
	 * @param {string} name Name to use for the template part.
	 */
	async nameAndFinalizeTemplatePart( name: string ): Promise< void > {
		await this.templatePartModalComponent.enterTemplateName( name );
		await this.templatePartModalComponent.clickCreate();
	}

	/**
	 * Select an existing template part from the template part selection modal.
	 * Because that modal can come from a variety of flows,
	 * this method assumes you have launched the modal first.
	 *
	 * @param {string} name Name of the template part to select.
	 */
	async selectExistingTemplatePartFromModal( name: string ): Promise< void > {
		await this.templatePartModalComponent.selectExistingTemplatePart( name );
		// This toast always fires for all insertertions done from this modal.
		await this.waitForConfirmationToast( `Template Part "${ name }" inserted.` );
	}

	/**
	 * Delete a template part in the site editor.
	 *
	 * @param {string[]} names Name of the template part.
	 */
	async deleteTemplateParts( names: string[] ): Promise< void > {
		await this.openNavSidebar();
		await this.fullSiteEditorNavSidebarComponent.navigateToTemplatePartsManager();
		for ( const name of names ) {
			await this.templatePartListComponent.deleteTemplatePart( name );
			await this.waitForConfirmationToast( `"${ name }" deleted.` );
		}
	}

	//#endregion

	//#region Misc

	/**
	 * Waits for a confirmation toast to appear with the provided text.
	 *
	 * @param {string} text The text we expect on the confirmation toast.
	 */
	async waitForConfirmationToast( text: string ): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.confirmationToast( text ) );
		await locator.waitFor();
	}

	/**
	 * Clears existing save confirmation toasts.
	 */
	private async clearExistingSaveConfirmationToast(): Promise< void > {
		const editorParent = await this.editor.parent();
		const toastLocator = editorParent.locator( selectors.confirmationToast( 'Site updated.' ) );
		if ( ( await toastLocator.count() ) > 0 ) {
			await toastLocator.click();
		}
	}

	//#endregion
}
