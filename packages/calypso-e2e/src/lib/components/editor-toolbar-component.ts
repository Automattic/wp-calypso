import { Page } from 'playwright';
import envVariables from '../../env-variables';
import { translateFromPage } from '../utils';
import { EditorComponent } from './editor-component';
import type { EditorPreviewOptions } from './types';

const panel = '.interface-navigable-region[class*="header"]';
const settingsButtonLabel = 'Settings';
const moreOptionsLabel = 'Options';
const selectors = {
	// Block Inserter
	// Note the partial class match. This is to support site and post editor. We can't use aria-label because of i18n. :(
	blockInserterButton: `${ panel } button[class*="inserter-toggle"]`,

	// Draft
	switchToDraftButton: `${ panel } button.editor-post-switch-to-draft`,

	// Preview
	previewButton: `${ panel } :text("Preview"):visible, [aria-label="Preview"]:visible`,
	desktopPreviewMenuItem: ( target: EditorPreviewOptions ) =>
		`button[role="menuitem"] span:text("${ target }")`,
	previewPane: ( target: EditorPreviewOptions ) => `.is-${ target.toLowerCase() }-preview`,

	// Publish
	publishButton: ( state: 'disabled' | 'enabled' ) => {
		const buttonState = state === 'disabled' ? 'true' : 'false';
		return `${ panel } button.editor-post-publish-button__button[aria-disabled="${ buttonState }"]`;
	},

	// Document overview
	documentOverviewButton: `${ panel } button[aria-label="Document Overview"]`,

	// Details popover
	detailsButton: `${ panel } button[aria-label="Details"]`,

	// Document Actions dropdown
	documentActionsDropdown: `${ panel } button[aria-label="Show template details"]`,
	documentActionsDropdownItem: ( itemSelector: string ) => `.popover-slot ${ itemSelector }`,
	documentActionsDropdownShowAll: `.popover-slot .edit-site-template-details__show-all-button`,

	// Editor settings
	settingsButton: ( label = settingsButtonLabel ) =>
		`${ panel } .edit-post-header__settings .interface-pinned-items button[aria-label="${ label }"]`,

	// Undo/Redo
	undoButton: 'button[aria-disabled=false][aria-label="Undo"]',
	redoButton: 'button[aria-disabled=false][aria-label="Redo"]',

	// More options
	moreOptionsButton: ( label = moreOptionsLabel ) => `${ panel } button[aria-label="${ label }"]`,

	// Site editor save
	saveSiteEditorButton: `${ panel } button.edit-site-save-button__button`,

	// Nav sidebar
	navSidebarButton:
		'button[aria-label="Block editor sidebar"],button[aria-label="Toggle navigation"]',
};

/**
 * Represents an instance of the WordPress.com Editor's persistent toolbar.
 */
export class EditorToolbarComponent {
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
	 * Translate string.
	 */
	private async translateFromPage( string: string ): Promise< string > {
		const editorParent = await this.editor.parent();
		return translateFromPage( editorParent, string );
	}

	/* General helper */

	/**
	 * Given a selector, determines whether the target button/toggle is
	 * in an expanded state.
	 *
	 * If the toggle is in the on state or otherwise in an expanded
	 * state, this method will return true. Otherwise, false.
	 *
	 * @param {string} selector Target selector.
	 * @returns {Promise<boolean>} True if target is in an expanded state. False otherwise.
	 */
	private async targetIsOpen( selector: string ): Promise< boolean > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selector );
		const pressed = await locator.getAttribute( 'aria-pressed' );
		const expanded = await locator.getAttribute( 'aria-expanded' );
		return pressed === 'true' || expanded === 'true';
	}

	/* Block Inserter */

	/**
	 * Opens the block inserter.
	 */
	async openBlockInserter(): Promise< void > {
		if ( ! ( await this.targetIsOpen( selectors.blockInserterButton ) ) ) {
			const editorParent = await this.editor.parent();
			const locator = editorParent.locator( selectors.blockInserterButton );
			await locator.click();
		}
	}

	/**
	 * Closes the block inserter.
	 */
	async closeBlockInserter(): Promise< void > {
		if ( await this.targetIsOpen( selectors.blockInserterButton ) ) {
			// We click on the panel instead of on the block inserter button as a workaround for an issue
			// that disables the block inserter button after inserting a block using the block API V2.
			// See https://github.com/WordPress/gutenberg/issues/43090.
			const editorParent = await this.editor.parent();
			const locator = editorParent.locator( panel ).locator( 'button[class*="inserter-toggle"]' );
			await locator.click();
		}
	}

	/* Draft */

	/**
	 * Clicks the Save draft button and waits until it's saved.
	 */
	async saveDraft(): Promise< void > {
		const editorParent = await this.editor.parent();
		// On a Simple site (desktop viewport) the domain upsell banner can
		// be covering the "Save draft" button. We need to close that banner to
		// be able to perform the click action.
		// See https://github.com/Automattic/wp-calypso/pull/76987
		await Promise.any( [
			editorParent.locator( '.wpcom-domain-upsell-callout__dismiss-icon' ).click(),
			editorParent.getByRole( 'button', { name: 'Save draft' } ).click( { trial: true } ),
		] );

		await editorParent.getByRole( 'button', { name: 'Save draft' } ).click();
		await editorParent.getByRole( 'button', { name: 'Saved' } ).waitFor();
	}

	/* Preview */

	/**
	 * Launches the Preview when in mobile mode.
	 *
	 * @returns {Page} Handler for the new page object.
	 */
	async openMobilePreview(): Promise< Page > {
		const editorParent = await this.editor.parent();
		const mobilePreviewButtonLocator = editorParent.locator( selectors.previewButton );

		const [ popup ] = await Promise.all( [
			this.page.waitForEvent( 'popup' ),
			mobilePreviewButtonLocator.click(),
		] );
		return popup;
	}

	/**
	 * Launches the Preview when in Desktop mode, then selects the
	 * target preview option.
	 */
	async openDesktopPreview( target: EditorPreviewOptions ): Promise< void > {
		// Click on the Preview button to open the menu.
		await this.openDesktopPreviewMenu();

		// Locate and click on the intended preview target.
		const editorParent = await this.editor.parent();
		const desktopPreviewMenuItemLocator = editorParent.locator(
			selectors.desktopPreviewMenuItem( target )
		);
		await desktopPreviewMenuItemLocator.click();

		// Verify the editor panel is resized and stable.
		const desktopPreviewPaneLocator = editorParent.locator( selectors.previewPane( target ) );
		await desktopPreviewPaneLocator.waitFor();
		const elementHandle = await desktopPreviewPaneLocator.elementHandle();
		await elementHandle?.waitForElementState( 'stable' );

		// Click on the Preview button to close the menu.
		await this.closeDesktopPreviewMenu();
	}

	/**
	 * Opens the Preview menu for Desktop viewport.
	 */
	async openDesktopPreviewMenu(): Promise< void > {
		if ( ! ( await this.targetIsOpen( selectors.previewButton ) ) ) {
			const editorParent = await this.editor.parent();
			const desktopPreviewButtonLocator = editorParent.locator( selectors.previewButton );
			await desktopPreviewButtonLocator.click();
		}
	}

	/**
	 * Closes the Preview menu for the Desktop viewport.
	 */
	async closeDesktopPreviewMenu(): Promise< void > {
		if ( await this.targetIsOpen( selectors.previewButton ) ) {
			const editorParent = await this.editor.parent();
			const desktopPreviewButtonLocator = editorParent.locator( selectors.previewButton );
			await desktopPreviewButtonLocator.click();
		}
	}

	/* Publish and unpublish */

	/**
	 * Returns the text present for the save/publish button.
	 *
	 * @returns {Promise<string>} String found on the button.
	 */
	async getPublishButtonText(): Promise< string > {
		const editorParent = await this.editor.parent();
		const publishButtonLocator = editorParent.locator( selectors.publishButton( 'enabled' ) );

		return await publishButtonLocator.innerText();
	}

	/**
	 * Clicks on the primary button to publish the article.
	 *
	 * This is applicable for the following scenarios:
	 * 	- publish of a new article (Publish)
	 * 	- update an existing article (Update)
	 * 	- schedule a post (Schedule)
	 */
	async clickPublish(): Promise< void > {
		const editorParent = await this.editor.parent();
		const publishButtonLocator = editorParent.locator( selectors.publishButton( 'enabled' ) );
		await publishButtonLocator.click();
	}

	/**
	 * Clicks on the `Switch to Draft` button and unpublish
	 * the article.
	 */
	async switchToDraft(): Promise< void > {
		const editorParent = await this.editor.parent();

		await Promise.race( [
			( async () => {
				// Works with Gutenberg >=v15.8.0
				await this.openSettings();
				await editorParent.getByRole( 'button', { name: 'Switch to draft' } ).click();
			} )(),
			( async () => {
				// Works with Gutenberg <v15.8.0
				await editorParent.getByRole( 'button', { name: 'Draft' } ).click();
			} )(),
		] );
	}

	/* Editor Settings sidebar */

	/**
	 * Opens the editor settings.
	 */
	async openSettings(): Promise< void > {
		const label = await this.translateFromPage( settingsButtonLabel );
		const selector = selectors.settingsButton( label );

		if ( await this.targetIsOpen( selector ) ) {
			return;
		}
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selector );
		await locator.click();
	}

	/**
	 * Closes the editor settings.
	 */
	async closeSettings(): Promise< void > {
		const label = await this.translateFromPage( settingsButtonLabel );
		const selector = selectors.settingsButton( label );

		if ( ! ( await this.targetIsOpen( selector ) ) ) {
			return;
		}
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selector );
		await locator.click();
	}

	/* Navigation sidebar */

	/**
	 * Opens the nav sidebar.
	 */
	async openNavSidebar(): Promise< void > {
		if ( await this.targetIsOpen( selectors.navSidebarButton ) ) {
			return;
		}

		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.navSidebarButton );
		await locator.click();
	}

	/**
	 * Closes the nav sidebar.
	 */
	async closeNavSidebar(): Promise< void > {
		if ( ! ( await this.targetIsOpen( selectors.navSidebarButton ) ) ) {
			return;
		}

		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.navSidebarButton );
		await locator.click();
	}

	/* List view */

	/**
	 * Opens the list view.
	 */
	async openListView(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// List view is not available on mobile!
			return;
		}

		if ( await this.targetIsOpen( selectors.documentOverviewButton ) ) {
			return;
		}

		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.documentOverviewButton );
		await locator.click();
	}

	/**
	 * Closes the list view.
	 */
	async closeListView(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// List view is not available on mobile!
			return;
		}

		if ( ! ( await this.targetIsOpen( selectors.documentOverviewButton ) ) ) {
			return;
		}

		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.documentOverviewButton );
		await locator.click();
	}

	/**
	 * Click the editor undo button. Throws an error if the button is not enabled.
	 *
	 * @throws If the undo button is not enabled.
	 */
	async undo(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.undoButton );
		await locator.click();
	}

	/**
	 * Click the editor redo button. Throws an error if the button is not enabled.
	 *
	 * @throws If the redo button is not enabled.
	 */
	async redo(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.redoButton );
		await locator.click();
	}

	/**
	 * Opens the more options menu (three dots).
	 */
	async openMoreOptionsMenu(): Promise< void > {
		const label = await this.translateFromPage( moreOptionsLabel );
		const selector = selectors.moreOptionsButton( label );

		if ( ! ( await this.targetIsOpen( selector ) ) ) {
			const editorParent = await this.editor.parent();
			const locator = editorParent.locator( selector );
			await locator.click();
		}
	}

	/** FSE unique buttons */

	/**
	 * Click the save button (publish equivalent) for the full site editor.
	 */
	async saveSiteEditor(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.saveSiteEditorButton );
		await locator.click();
	}

	/**
	 * Click the document actions icon for the full site editor.
	 */
	async clickDocumentActionsIcon(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.documentActionsDropdown );
		await locator.click();
	}

	/**
	 * Click the document actions icon for the full site editor.
	 */
	async clickDocumentActionsDropdownItem( itemName: string ): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.documentActionsDropdownItem( itemName ) );
		await locator.click();
	}
}
