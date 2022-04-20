import { Locator, Page } from 'playwright';
import {
	BlockInserter,
	EditorSidebarBlockInserterComponent,
	EditorToolbarComponent,
	EditorWelcomeTourComponent,
	SiteType,
	EditorPopoverMenuComponent,
	EditorSiteStylesComponent,
	ColorSettings,
	TypographySettings,
	ColorLocation,
	FullSiteEditorSavePanelComponent,
	EditorBlockToolbarComponent,
} from '..';
import { getCalypsoURL } from '../../data-helper';
import { getIdFromBlock } from '../../element-helper';
import envVariables from '../../env-variables';
import {
	BlockToolbarButtonIdentifier,
	EditorNavSidebarComponent,
	TemplatePartListComponent,
} from '../components';
import { TemplatePartModalComponent } from '../components/template-part-modal-component';

const wpAdminPath = 'wp-admin/themes.php';

const selectors = {
	editorIframe: `iframe.is-loaded[src*="${ wpAdminPath }"]`,
	editorRoot: 'body.block-editor-page',
	editorCanvasIframe: 'iframe[name="editor-canvas"]',
	editorCanvasRoot: '.wp-site-blocks',
	templateLoadingSpinner: '[aria-label="Block: Template Part"] .components-spinner',
	closeStylesWelcomeGuideButton:
		'[aria-label="Welcome to styles"] button[aria-label="Close dialog"]',
	// The toast can have double quotes, so we use single quotes here.
	confirmationToast: ( text: string ) => `.components-snackbar:has-text('${ text }')`,
	focusedBlock: ( blockSelector: string ) => `${ blockSelector }.is-selected`,
	parentOfFocusedBlock: ( blockSelector: string ) => `${ blockSelector }.has-child-selected`,
};

/**
 * Represents an instance of the FSE site editor.
 * This class is composed of editor components, combining them into larger flows.
 */
export class FullSiteEditorPage {
	private page: Page;
	private editor: Locator;
	private editorCanvas: Locator;

	private editorToolbarComponent: EditorToolbarComponent;
	private editorSidebarBlockInserterComponent: EditorSidebarBlockInserterComponent;
	private editorWelcomeTourComponent: EditorWelcomeTourComponent;
	private editorPopoverMenuComponent: EditorPopoverMenuComponent;
	private editorSiteStylesComponent: EditorSiteStylesComponent;
	private fullSiteEditorSavePanelComponent: FullSiteEditorSavePanelComponent;
	private editorBlockToolbarComponent: EditorBlockToolbarComponent;
	private editorNavSidebarComponent: EditorNavSidebarComponent;
	private templatePartModalComponent: TemplatePartModalComponent;
	private templatePartListComponent: TemplatePartListComponent;

	/**
	 * Constructs an instance of the page POM class.
	 *
	 * @param {Page} page The underlying page.
	 * @param {Object} param0 Keyed object parameter.
	 * @param {SiteType} param0.target Target editor type. Defaults to 'simple'.
	 */
	constructor( page: Page, { target = 'simple' }: { target?: SiteType } = {} ) {
		this.page = page;

		if ( target === 'atomic' ) {
			// For Atomic editors, there is no iFrame - the editor is
			// part of the page DOM and is thus accessible directly.
			this.editor = page.locator( selectors.editorRoot );
		} else {
			// For Simple editors, the editor is located within an iFrame
			// and thus it must first be extracted.
			this.editor = page.frameLocator( selectors.editorIframe ).locator( selectors.editorRoot );
		}

		this.editorCanvas = this.editor
			.frameLocator( selectors.editorCanvasIframe )
			.locator( selectors.editorCanvasRoot );

		this.editorToolbarComponent = new EditorToolbarComponent( page, this.editor );
		this.editorWelcomeTourComponent = new EditorWelcomeTourComponent( page, this.editor );
		this.editorPopoverMenuComponent = new EditorPopoverMenuComponent( page, this.editor );
		this.editorSiteStylesComponent = new EditorSiteStylesComponent( page, this.editor );
		this.editorBlockToolbarComponent = new EditorBlockToolbarComponent( page, this.editor );
		this.editorSidebarBlockInserterComponent = new EditorSidebarBlockInserterComponent(
			page,
			this.editor
		);
		this.fullSiteEditorSavePanelComponent = new FullSiteEditorSavePanelComponent(
			page,
			this.editor
		);
		this.templatePartModalComponent = new TemplatePartModalComponent( page, this.editor );
		this.templatePartListComponent = new TemplatePartListComponent( page, this.editor );
		this.editorNavSidebarComponent = new EditorNavSidebarComponent( page, this.editor );
	}

	/**
	 * Visit the site editor by URL directly.
	 *
	 * @param {string} siteHostName Host name of the site, without scheme. (e.g. testsite.wordpress.com)
	 */
	async visit( siteHostName: string ): Promise< void > {
		await this.page.goto( getCalypsoURL( `site-editor/${ siteHostName }` ) );
	}

	/**
	 * Waits until the site editor is fully loaded.
	 */
	async waitUntilLoaded(): Promise< void > {
		// There are more stages to the site editor loading than the regular editor.
		// The most reliable "last" thing to load is the canvas iframe
		await this.editorCanvas.waitFor( { timeout: 60 * 1000 } );
		// But then, template parts load async afterwards!
		const spinnerLocator = this.editorCanvas.locator( selectors.templateLoadingSpinner );
		// There could be many spinners, so we will keep waiting for the first to be detached.
		await spinnerLocator.first().waitFor( { state: 'detached' } );
	}

	/**
	 * Does all waiting and initial actions to prepare the site editor for interaction.
	 *
	 * @param {object} param0 Keyed object of options.
	 * @param {boolean} param0.leaveWithoutSaving Set if we should auto-except dialog about unsaved changes when leaving.
	 */
	async prepareForInteraction(
		{
			leaveWithoutSaving,
		}: {
			leaveWithoutSaving?: boolean;
		} = { leaveWithoutSaving: true }
	): Promise< void > {
		await this.waitUntilLoaded();
		await this.editorWelcomeTourComponent.forceDismissWelcomeTour();

		if ( leaveWithoutSaving ) {
			this.page.on( 'dialog', async ( dialog ) => {
				if ( dialog.type() === 'beforeunload' ) {
					await dialog.accept();
				}
			} );
		}
	}

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
	 * @returns The a frame-safe locator to the top of the block.
	 */
	async addBlockFromSidebar( blockName: string, blockEditorSelector: string ): Promise< Locator > {
		await this.editorToolbarComponent.openBlockInserter();
		await this.addBlockFromInserter( blockName, this.editorSidebarBlockInserterComponent );

		const addedBlockId = await getIdFromBlock(
			this.editorCanvas.locator(
				`${ selectors.focusedBlock( blockEditorSelector ) },${ selectors.parentOfFocusedBlock(
					blockEditorSelector
				) }`
			)
		);

		// Dismiss the block inserter if viewport is larger than mobile to
		// ensure no interference from the block inserter in subsequent actions on the editor.
		// In mobile, the block inserter will auto-close.
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await this.editorToolbarComponent.closeBlockInserter();
		}

		return this.editorCanvas.locator( `#${ addedBlockId }` );
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
	 * Opens the site styles sidebar in the site editor.
	 *
	 * @param {object} param0 Keyed options parameter.
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
				const safelyWatchForWelcomeGuide = () => this.closeStylesWelcomeGuide().catch();
				safelyWatchForWelcomeGuide();
			}
			await this.editorPopoverMenuComponent.clickMenuButton( 'Styles' );
		}
	}

	/**
	 * Closes the site styles welcome guide.
	 */
	private async closeStylesWelcomeGuide(): Promise< void > {
		const locator = this.editor.locator( selectors.closeStylesWelcomeGuideButton );
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
	async setGlobalColorStlye(
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
	 * Resets the site styles to the defaults for the theme.
	 */
	async resetStylesToDefaults(): Promise< void > {
		await this.editorSiteStylesComponent.openMoreActionsMenu();
		await this.editorPopoverMenuComponent.clickMenuButton( 'Reset to defaults' );
	}

	/**
	 * Save the changes in the full site editor (equivalent of publish).
	 */
	async save(): Promise< void > {
		await this.clearExistingSaveConfirmationToast();
		await this.editorToolbarComponent.saveSiteEditor();
		await this.fullSiteEditorSavePanelComponent.confirmSave();
		const toastLocator = this.editor.locator( selectors.confirmationToast( 'Site updated.' ) );
		await toastLocator.waitFor();
	}

	/**
	 * Clears existing save confirmation toasts.
	 */
	private async clearExistingSaveConfirmationToast(): Promise< void > {
		const toastLocator = this.editor.locator( selectors.confirmationToast( 'Site updated.' ) );
		if ( ( await toastLocator.count() ) > 0 ) {
			await toastLocator.click();
		}
	}

	/**
	 *
	 * @param uniqueBlockSelector
	 * @returns
	 */
	async focusBlock( uniqueBlockSelector: string ): Promise< void > {
		const focusedBlockLocator = this.editorCanvas.locator(
			selectors.focusedBlock( uniqueBlockSelector )
		);
		if ( ( await focusedBlockLocator.count() ) > 0 ) {
			// The block is already focused
			return;
		}

		const blockLocator = this.editorCanvas.locator( uniqueBlockSelector );
		await blockLocator.click();
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
	 *
	 * @param optionName
	 */
	async clickBlockToolbarOption( optionName: string ): Promise< void > {
		await this.editorBlockToolbarComponent.clickOptionsButton();
		await this.editorPopoverMenuComponent.clickMenuButton( optionName );
	}

	/**
	 *
	 */
	async clickBlockToolbarParentBlock(): Promise< void > {
		await this.editorBlockToolbarComponent.clickParentBlockButton();
	}

	/**
	 *
	 * @param name
	 */
	async nameAndFinalizeTemplatePart( name: string ): Promise< void > {
		await this.templatePartModalComponent.enterTemplateName( name );
		await this.templatePartModalComponent.clickCreate();
	}

	/**
	 *
	 * @param name
	 */
	async selectExistingTemplatePartFromModal( name: string ): Promise< void > {
		await this.templatePartModalComponent.selectExistingTemplatePart( name );
		const toastLocator = this.editor.locator(
			selectors.confirmationToast( `Template Part "${ name }" inserted.` )
		);
		await toastLocator.waitFor();
	}

	/**
	 * Delete a template part.
	 *
	 * @param {string} name Name of the template part.
	 */
	async deleteTemplatePart( name: string ): Promise< void > {
		await this.editorToolbarComponent.openNavSidebar();
		await this.editorNavSidebarComponent.clickMenuLink( 'Template Parts' );
		await this.templatePartListComponent.deleteTemplatePart( name );
	}

	/**
	 *
	 * @param text
	 */
	async waitForConfirmationToast( text: string ): Promise< void > {
		const locator = this.editor.locator( selectors.confirmationToast( text ) );
		await locator.waitFor();
	}
}
