import { Locator, Page } from 'playwright';
import {
	BlockInserter,
	EditorSidebarBlockInserterComponent,
	EditorToolbarComponent,
	EditorWelcomeTourComponent,
	SiteType,
} from '..';
import { getCalypsoURL } from '../../data-helper';
import envVariables from '../../env-variables';
import { EditorPopoverMenuComponent } from '../components';

const wpAdminPath = 'wp-admin/themes.php';

const selectors = {
	editorIframe: `iframe.is-loaded[src*="${ wpAdminPath }"]`,
	editorRoot: 'body.block-editor-page',
	editorCanvasIframe: 'iframe[name="editor-canvas"]',
	editorCanvasRoot: '.wp-site-blocks',
	templateLoadingSpinner: '[aria-label="Block: Template Part"] .components-spinner',
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
		this.editorSidebarBlockInserterComponent = new EditorSidebarBlockInserterComponent(
			page,
			this.editor
		);
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
	 */
	async addBlockFromSidebar( blockName: string ): Promise< void > {
		await this.editorToolbarComponent.openBlockInserter();
		await this.addBlockFromInserter( blockName, this.editorSidebarBlockInserterComponent );

		// Dismiss the block inserter if viewport is larger than mobile to
		// ensure no interference from the block inserter in subsequent actions on the editor.
		// In mobile, the block inserter will auto-close.
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await this.editorToolbarComponent.closeBlockInserter();
		}
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
	 */
	async openSiteStyles(): Promise< void > {
		await this.editorToolbarComponent.openMoreOptionsMenu();
		await this.editorPopoverMenuComponent.clickMenuButton( 'Styles' );
	}
}
