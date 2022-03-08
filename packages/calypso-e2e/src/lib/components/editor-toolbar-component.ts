import { Page, FrameLocator } from 'playwright';

export type PreviewOptions = 'Desktop' | 'Mobile' | 'Tablet';

const panel = 'div.interface-interface-skeleton__header';
const selectors = {
	// Block Inserter
	blockInserterButton: `${ panel } button.edit-post-header-toolbar__inserter-toggle`,

	// Draft
	saveDraftButton: ( state: 'disabled' | 'enabled' ) => {
		const buttonState = state === 'disabled' ? 'true' : 'false';
		return `${ panel } button[aria-label="Save draft"][aria-disabled="${ buttonState }"]`;
	},
	switchToDraftButton: `${ panel } button.editor-post-switch-to-draft`,

	// Preview
	previewButton: `${ panel } :text("Preview"):visible`,
	desktopPreviewMenuItem: ( target: PreviewOptions ) =>
		`button[role="menuitem"] span:text("${ target }")`,
	previewPane: ( target: PreviewOptions ) => `.is-${ target.toLowerCase() }-preview`,

	// Publish
	publishButton: ( state: 'disabled' | 'enabled' ) => {
		const buttonState = state === 'disabled' ? 'true' : 'false';
		return `${ panel } button.editor-post-publish-button__button[aria-disabled="${ buttonState }"]`;
	},

	// Editor settings
	settingsButton: `${ panel } .edit-post-header__settings .interface-pinned-items button:first-child`,
};

/**
 * Represents an instance of the WordPress.com Editor's navigation sidebar.
 * The component is available only in the Desktop viewport.
 */
export class EditorToolbarComponent {
	private page: Page;
	private frameLocator: FrameLocator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {FrameLocator} frameLocator Locator of the editor iframe.
	 */
	constructor( page: Page, frameLocator: FrameLocator ) {
		this.page = page;
		this.frameLocator = frameLocator;
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
		const locator = this.frameLocator.locator( selector );
		const pressed = await locator.getAttribute( 'aria-pressed' );
		const expanded = await locator.getAttribute( 'aria-expanded' );
		return pressed === 'true' || expanded === 'true';
	}

	/* Block Inserter */

	/**
	 * Opens the block inserter.
	 */
	async openBlockInserter(): Promise< void > {
		// const toolbarLocator = this.frameLocator.locator( panel );
		// await toolbarLocator.click( { position: { x: 100, y: 0 } } );

		if ( ! ( await this.targetIsOpen( selectors.blockInserterButton ) ) ) {
			const locator = this.frameLocator.locator( selectors.blockInserterButton );
			await locator.click();
		}
	}

	/**
	 * Closes the block inserter.
	 */
	async closeBlockInserter(): Promise< void > {
		if ( await this.targetIsOpen( selectors.blockInserterButton ) ) {
			const locator = this.frameLocator.locator( selectors.blockInserterButton );
			await locator.click();
		}
	}

	/* Draft */

	/**
	 * Clicks on the 'Save Draft' button on the editor.
	 *
	 * If the button cannot be clicked, the method short-circuits.
	 */
	async saveDraft(): Promise< void > {
		const saveButtonLocator = this.frameLocator.locator( selectors.saveDraftButton( 'enabled' ) );

		try {
			await saveButtonLocator.waitFor( { timeout: 5 * 1000 } );
		} catch {
			return;
		}

		await saveButtonLocator.click();

		// Ensure the Save Draft button is disabled after successful save.
		const savedButtonLocator = this.frameLocator.locator( selectors.saveDraftButton( 'disabled' ) );
		await savedButtonLocator.waitFor();
	}

	/* Preview */

	/**
	 * Launches the Preview when in mobile mode.
	 *
	 * @returns {Page} Handler for the new page object.
	 */
	async openMobilePreview(): Promise< Page > {
		const mobilePreviewButtonLocator = this.frameLocator.locator( selectors.previewButton );

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
	async openDesktopPreview( target: PreviewOptions ): Promise< void > {
		// Click on the Preview button to open the menu.
		await this.openDesktopPreviewMenu();

		// Locate and click on the intended preview target.
		const desktopPreviewMenuItemLocator = this.frameLocator.locator(
			selectors.desktopPreviewMenuItem( target )
		);
		await desktopPreviewMenuItemLocator.click();

		// Verify the editor panel is resized and stable.
		const desktopPreviewPaneLocator = this.frameLocator.locator( selectors.previewPane( target ) );
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
			const desktopPreviewButtonLocator = this.frameLocator.locator( selectors.previewButton );
			await desktopPreviewButtonLocator.click();
		}
	}

	/**
	 * Closes the Preview menu for the Desktop viewport.
	 */
	async closeDesktopPreviewMenu(): Promise< void > {
		if ( await this.targetIsOpen( selectors.previewButton ) ) {
			const desktopPreviewButtonLocator = this.frameLocator.locator( selectors.previewButton );
			await desktopPreviewButtonLocator.click();
		}
	}

	/* Publish and unpublish */

	/**
	 * Clicks on the primary button to publish the article.
	 *
	 * This is applicable for the following scenarios:
	 * 	- publish of a new article (Publish)
	 * 	- update an existing article (Update)
	 * 	- schedule a post (Schedule)
	 */
	async clickPublish(): Promise< void > {
		const publishButtonLocator = this.frameLocator.locator( selectors.publishButton( 'enabled' ) );
		await publishButtonLocator.click();
	}

	/**
	 * Clicks on the `Switch to Draft` button and unpublish
	 * the article.
	 */
	async switchToDraft(): Promise< void > {
		const swithcToDraftLocator = this.frameLocator.locator( selectors.switchToDraftButton );
		await swithcToDraftLocator.click();
	}

	/* Editor Settings sidebar */

	/**
	 * Opens the editor settings.
	 */
	async openSettings(): Promise< void > {
		if ( await this.targetIsOpen( selectors.settingsButton ) ) {
			return;
		}
		const locator = this.frameLocator.locator( selectors.settingsButton );
		await locator.click();
	}

	/**
	 * Closes the editor settings.
	 */
	async closeSettings(): Promise< void > {
		if ( ! ( await this.targetIsOpen( selectors.settingsButton ) ) ) {
			return;
		}
		const locator = this.frameLocator.locator( selectors.settingsButton );
		await locator.click();
	}
}
