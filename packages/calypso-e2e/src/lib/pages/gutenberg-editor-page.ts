import assert from 'assert';
import { Page, Frame, ElementHandle, Response } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { reloadAndRetry } from '../../element-helper';
import envVariables from '../../env-variables';
import {
	EditorPublishPanelComponent,
	EditorNavSidebarComponent,
	EditorToolbarComponent,
	EditorSettingsSidebarComponent,
	NavbarComponent,
} from '../components';
import type { PreviewOptions } from '../components';

const selectors = {
	// iframe and editor
	editorFrame: '.calypsoify.is-iframe iframe.is-loaded',
	editorTitle: '.editor-post-title__input',

	// Block inserter
	blockInserterToggle: 'button.edit-post-header-toolbar__inserter-toggle',
	blockInserterPanel: '.block-editor-inserter__content',
	blockSearch: '.block-editor-inserter__search input[type="search"]',
	blockInserterResultItem: '.block-editor-block-types-list__list-item',

	// Within the editor body.
	blockAppender: '.block-editor-default-block-appender',
	paragraphBlocks: 'p.block-editor-rich-text__editable',
	blockWarning: '.block-editor-warning',

	// Toast
	toastViewPostLink: '.components-snackbar__content a:text-matches("View (Post|Page)", "i")',

	// Welcome tour
	welcomeTourCloseButton: 'button[aria-label="Close Tour"]',
};

/**
 * Represents an instance of the WPCOM's Gutenberg editor page.
 */
export class GutenbergEditorPage {
	private page: Page;
	private editorPublishPanelComponent: EditorPublishPanelComponent;
	private editorNavSidebarComponent: EditorNavSidebarComponent;
	private editorToolbarComponent: EditorToolbarComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.editorPublishPanelComponent = new EditorPublishPanelComponent(
			page,
			page.frameLocator( selectors.editorFrame )
		);
		this.editorNavSidebarComponent = new EditorNavSidebarComponent(
			page,
			page.frameLocator( selectors.editorFrame )
		);
		this.editorToolbarComponent = new EditorToolbarComponent(
			page,
			page.frameLocator( selectors.editorFrame )
		);
	}

	/**
	 * Opens the "new post/page" page. By default it will open the "new post" page.
	 *
	 * Example "new post": {@link https://wordpress.com/post}
	 * Example "new page": {@link https://wordpress.com/page}
	 */
	async visit( type: 'post' | 'page' = 'post' ): Promise< Response | null > {
		const request = await this.page.goto( getCalypsoURL( type ) );
		await this.waitUntilLoaded();

		return request;
	}

	/**
	 * Initialization steps to ensure the page is fully loaded.
	 *
	 * @returns {Promise<Frame>} iframe holding the editor.
	 */
	async waitUntilLoaded(): Promise< Frame > {
		const frame = await this.getEditorFrame();
		// Traditionally we try to avoid waits not related to the current flow.
		// However, we need a stable way to identify loading being done. NetworkIdle
		// takes too long here, so the most reliable alternative is the title being
		// visible.
		await frame.waitForSelector( selectors.editorTitle );
		// Once https://github.com/Automattic/wp-calypso/issues/57660 is resolved,
		// the next line should be removed.
		await this.forceDismissWelcomeTour();

		return frame;
	}

	/**
	 * Forcefully dismisses the Welcome Tour via action dispatch.
	 *
	 * @see {@link https://github.com/Automattic/wp-calypso/issues/57660}
	 */
	async forceDismissWelcomeTour(): Promise< void > {
		const frame = await this.getEditorFrame();

		await frame.waitForFunction(
			async () =>
				await ( window as any ).wp.data
					.select( 'automattic/wpcom-welcome-guide' )
					.isWelcomeGuideStatusLoaded()
		);

		await frame.waitForFunction( async () => {
			const actionPayload = await ( window as any ).wp.data
				.dispatch( 'automattic/wpcom-welcome-guide' )
				.setShowWelcomeGuide( false );

			return actionPayload.show === false;
		} );
	}

	/**
	 * Return the editor iframe.
	 *
	 * @returns {Promise<Frame>} iframe holding the editor.
	 */
	async getEditorFrame(): Promise< Frame > {
		const locator = this.page.locator( selectors.editorFrame );

		const elementHandle = await locator.elementHandle( {
			timeout: 105 * 1000,
		} );

		if ( ! elementHandle ) {
			throw new Error( 'Could not locate editor iframe.' );
		}

		return ( await elementHandle.contentFrame() ) as Frame;
	}

	/**
	 * Enters the text into the title block and verifies the result.
	 *
	 * @param {string} title Text to be used as the title.
	 * @returns {Promise<void>} No return value.
	 * @throws {assert.AssertionError} If text entered and text read back do not match.
	 */
	async enterTitle( title: string ): Promise< void > {
		const sanitizedTitle = title.trim();
		await this.setTitle( sanitizedTitle );
		const readBack = await this.getTitle();
		assert.strictEqual( readBack, sanitizedTitle );
	}

	/**
	 * Fills the title block with text.
	 *
	 * @param {string} title Text to be used as the title.
	 * @returns {Promise<void>} No return value.
	 */
	async setTitle( title: string ): Promise< void > {
		const frame = await this.getEditorFrame();
		await frame.click( selectors.editorTitle );
		await frame.fill( selectors.editorTitle, title );
	}

	/**
	 * Returns the text as entered in the title block, or an empty string if
	 * not found.
	 *
	 * @returns {Promise<string>} Text value of the title block.
	 */
	async getTitle(): Promise< string > {
		const frame = await this.getEditorFrame();
		await frame.waitForSelector( selectors.editorTitle );
		return ( await frame.$eval( selectors.editorTitle, ( el ) => el.textContent ) ) || '';
	}

	/**
	 * Enters text into the paragraph block(s) and verifies the result.
	 *
	 * @param {string} text Text to be entered into the paragraph blocks, separated by newline characters.
	 * @returns {Promise<void>} No return value.
	 * @throws {assert.AssertionError} If text entered and text read back do not match.
	 */
	async enterText( text: string ): Promise< void > {
		await this.setText( text );
		const readBack = await this.getText();
		assert.strictEqual( readBack, text );
	}

	/**
	 * Enters text into the body, splitting newlines into new pragraph blocks as necessary.
	 *
	 * @param {string} text Text to be entered into the body.
	 * @returns {Promise<void>} No return value.
	 */
	async setText( text: string ): Promise< void > {
		const frame = await this.getEditorFrame();

		const lines = text.split( '\n' );
		await frame.click( selectors.blockAppender );

		// Playwright does not break up newlines in Gutenberg. This causes issues when we expect
		// text to be broken into new lines/blocks. This presents an unexpected issue when entering
		// text such as 'First sentence\nSecond sentence', as it is all put in one line.
		// frame.type() will respect newlines like a human would, but it is slow.
		// This approach will run faster than using frame.type() while respecting the newline chars.
		await Promise.all(
			lines.map( async ( line, index ) => {
				await frame.fill( `${ selectors.paragraphBlocks }:nth-of-type(${ index + 1 })`, line );
				await this.page.keyboard.press( 'Enter' );
			} )
		);
	}

	/**
	 * Returns the text as entered in the paragraph blocks.
	 *
	 * @returns {string} Visible text in the paragraph blocks, concatenated into one string.
	 */
	async getText(): Promise< string > {
		const frame = await this.getEditorFrame();

		// Each blocks have the same overall selector. This will obtain a list of
		// blocks that are paragraph type and return an array of ElementHandles.
		const paragraphBlocks = await frame.$$( selectors.paragraphBlocks );

		// Extract the textContent of each paragraph block into a list.
		// Note the special condition for an empty paragraph block, noted below.
		const lines = await Promise.all(
			paragraphBlocks.map( async function ( block ) {
				// This U+FEFF character is present in the textContent of an otherwise
				// empty paragraph block and will evaluate to truthy.
				const text = String( await block.textContent() ).replace( /\ufeff/g, '' );

				if ( ! text ) {
					return;
				}

				return text;
			} )
		);

		// Strip out falsey values.
		return lines.filter( Boolean ).join( '\n' );
	}

	/**
	 * Closes all panels that can be opened in the editor.
	 *
	 * This method will attempt to close the following panels:
	 * 	- Publish Panel (including pre-publish checklist)
	 * 	- Editor Settings Panel
	 * 	- Editor Navigation Sidebar
	 */
	async closeAllPanels(): Promise< void > {
		try {
			await this.editorPublishPanelComponent.closePanel();
		} catch {
			// noop
		}
		try {
			await this.editorNavSidebarComponent.closeSidebar();
		} catch {
			// noop
		}
		try {
			await this.editorToolbarComponent.closeSettings();
		} catch {
			// noop
		}
	}

	/**
	 * Adds a Gutenberg block from the block inserter panel.
	 *
	 * The name is expected to be formatted in the same manner as it
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
	 * @param {string} blockName Name of the block to be inserted.
	 * @param {string} blockEditorSelector Selector to find the parent block element in the editor.
	 */
	async addBlock( blockName: string, blockEditorSelector: string ): Promise< ElementHandle > {
		const frame = await this.getEditorFrame();
		// Click on the editor title to work around the following issue:
		// https://github.com/Automattic/wp-calypso/issues/61508
		await frame.click( selectors.editorTitle );

		await this.editorToolbarComponent.openBlockInserter();
		await this.searchBlockInserter( blockName );
		await frame.click( `${ selectors.blockInserterResultItem } span:text("${ blockName }")` );
		// Confirm the block has been added to the editor body.
		const elementHandle = await frame.waitForSelector( `${ blockEditorSelector }.is-selected` );

		// Dismiss the block inserter if viewport is larger than mobile to ensure
		// no interference from the block inserter in subsequent actions on the editor.
		// In mobile, the block inserter will auto-close.
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await this.editorToolbarComponent.closeBlockInserter();
		}

		return elementHandle;
	}

	/**
	 * Remove the block from the editor.
	 *
	 * This method requires the handle to the block in question to be passed in as parameter.
	 *
	 * @param {ElementHandle} blockHandle ElementHandle of the block to be removed.
	 */
	async removeBlock( blockHandle: ElementHandle ): Promise< void > {
		await blockHandle.click();
		await this.page.keyboard.press( 'Backspace' );
	}

	/**
	 * Adds a pattern from the block inserter panel.
	 *
	 * The name is expected to be formatted in the same manner as it
	 * appears on the label when visible in the block inserter panel.
	 *
	 * Example:
	 * 		- Two images side by side
	 *
	 * @param {string} patternName Name of the pattern to insert.
	 */
	async addPattern( patternName: string ): Promise< ElementHandle > {
		const frame = await this.getEditorFrame();
		await this.editorToolbarComponent.openBlockInserter();
		await this.searchBlockInserter( patternName );
		await frame.click( `div[aria-label="${ patternName }"]` );
		return await frame.waitForSelector( `:text('Block pattern "${ patternName }" inserted.')` );
	}

	/**
	 * Given a string, enters the said string to the block inserter search bar.
	 *
	 * @param {string} text Text to search.
	 */
	async searchBlockInserter( text: string ): Promise< void > {
		const frame = await this.getEditorFrame();
		await frame.fill( selectors.blockSearch, text );
	}

	/**
	 * Opens the Settings sidebar.
	 */
	async openSettings(): Promise< void > {
		await this.editorToolbarComponent.openSettings();
	}

	/**
	 * Closes the Settings sidebar.
	 */
	async closeSettings(): Promise< void > {
		// On mobile, the settings panel close button is located on the settings panel itself.
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// {@TODO} Temporary measure, to be unified into framelocator based class
			// once EditorSettingsSidebarComponent is refactored.
			const editorSettingsSidebarComponent = new EditorSettingsSidebarComponent(
				await this.getEditorFrame(),
				this.page
			);
			await editorSettingsSidebarComponent.closeSidebar();
		}
		await this.editorToolbarComponent.closeSettings();
	}

	/**
	 * Publishes the post or page.
	 *
	 * @param {boolean} visit Whether to then visit the page.
	 * @returns {URL} Published article's URL.
	 */
	async publish( { visit = false }: { visit?: boolean } = {} ): Promise< URL > {
		// Click on the main publish action button on the toolbar.
		await this.editorToolbarComponent.clickPublish();

		if ( await this.editorPublishPanelComponent.panelIsOpen() ) {
			// Invoke the second stage of the publish step which handles the
			// publish checklist panel if it is present.
			await this.editorPublishPanelComponent.publish();
		}

		// In some cases the post may be published but the EditorPublishPanelComponent
		// is either not present or forcibly dismissed due to a bug.
		// eg. publishing a post with some of the Jetpack Earn blocks.
		// By racing the two methods of obtaining the published article's URL, we can
		// guarantee that one or the other works.
		const publishedURL: URL = await Promise.race( [
			this.editorPublishPanelComponent.getPublishedURL(),
			this.getPublishedURLFromToast(),
		] );

		if ( visit ) {
			await this.visitPublishedPost( publishedURL.href );
		}
		return publishedURL;
	}

	/**
	 * Unpublishes the post or page by switching to draft.
	 */
	async unpublish(): Promise< void > {
		await this.editorToolbarComponent.switchToDraft();
	}

	/**
	 * Obtains the published article's URL from post-publish panels.
	 *
	 * This method is only able to obtain the published article's URL if immediately
	 * preceded by the action of publishing the article *and* the post-publish panel
	 * being visible.
	 *
	 * @returns {URL} Published article's URL.
	 */
	async getPublishedURLFromToast(): Promise< URL > {
		const frame = await this.getEditorFrame();

		const toastLocator = frame.locator( selectors.toastViewPostLink );
		const publishedURL = ( await toastLocator.getAttribute( 'href' ) ) as string;
		return new URL( publishedURL );
	}

	/**
	 * Saves the currently open post as draft.
	 */
	async saveDraft(): Promise< void > {
		await this.editorToolbarComponent.saveDraft();
	}

	/**
	 * Checks whether the editor has any block warnings/errors displaying.
	 *
	 * @returns True if there are block warnings/errors, false otherwise.
	 */
	async editorHasBlockWarnings(): Promise< boolean > {
		const frame = await this.getEditorFrame();
		return await frame.isVisible( selectors.blockWarning );
	}

	/**
	 * Visits the published entry from the post-publish sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	private async visitPublishedPost( url: string ): Promise< void > {
		// Some blocks, like "Click To Tweet" or "Logos" cause the post-publish
		// panel to close immediately and leave the post in the unsaved state for
		// some reason. Since the post state is unsaved, the warning dialog will be
		// displayed on the published post link click. By default, Playwright will
		// dismiss the dialog so we need this listener to accept it and open the
		// published post.
		//
		// Once https://github.com/Automattic/wp-calypso/issues/54421 is resolved,
		// this listener can be removed.
		this.page.once( 'dialog', async ( dialog ) => {
			await dialog.accept();
		} );

		await this.page.goto( url, { waitUntil: 'domcontentloaded' } );

		await reloadAndRetry( this.page, confirmPostShown );

		/**
		 * Closure to confirm that post is shown on screen as expected.
		 *
		 * In rare cases, visiting the post immediately after it has been published can result
		 * in the post not being visible to the public yet. In such cases, an error message is
		 * instead shown to the user.
		 *
		 * When used in conjunction with `reloadAndRetry` this method will reload the page
		 * multiple times to ensure the post content is shown.
		 *
		 * @param page
		 */
		async function confirmPostShown( page: Page ): Promise< void > {
			await page.waitForSelector( '.entry-content', { timeout: 15 * 1000 } );
		}
	}

	/**
	 * Leave the editor to return to the Calypso dashboard.
	 *
	 * On desktop sized viewport, this method first opens the editor navigation
	 * sidebar, then clicks on the `Dashboard` link.
	 *
	 * On mobile sized viewport, this method clicks on Navbar > My Sites.
	 *
	 * The resulting page can change based on where you come from, and the viewport. Either way, the resulting landing spot
	 * will have access to the Calyspo sidebar, allowing navigation around Calypso.
	 */
	async exitEditor(): Promise< void > {
		await this.editorNavSidebarComponent.openSidebar();

		// There are three different places to return to,
		// depending on how the editor was entered.
		const navigationPromise = Promise.race( [
			this.page.waitForNavigation( { url: '**/home/**' } ),
			this.page.waitForNavigation( { url: '**/posts/**' } ),
			this.page.waitForNavigation( { url: '**/pages/**' } ),
		] );
		const actions: Promise< unknown >[] = [ navigationPromise ];

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// Mobile viewports do not use an EditorNavSidebar.
			// Instead, the regular NavBar is used, and the
			// `My Sites` button exits the editor.
			const navbarComponent = new NavbarComponent( this.page );
			actions.push( navbarComponent.clickMySites() );
		} else {
			actions.push( this.editorNavSidebarComponent.exitEditor() );
		}

		// Perform the actions and resolve promises.
		await Promise.all( actions );
	}

	/* Previews */

	/**
	 * Launches the Preview.
	 *
	 * For Desktop viewports, this method will not return any value.
	 * For Mobile viewports, this method will return a reference to a popup Page.
	 *
	 * @returns {Page|void} Handler for the Page object on mobile. Void otherwise.
	 */
	async preview( target?: PreviewOptions ): Promise< Page | void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			return await this.editorToolbarComponent.openMobilePreview();
		}
		if ( ! target ) {
			throw new Error( 'Preview target must be defined.' );
		}

		await this.editorToolbarComponent.openDesktopPreview( target );
	}

	/**
	 * Closes the preview.
	 *
	 * For Desktop viewports, this method will return the editor pane to the default
	 * value of `desktop`.
	 * For Mobile viewports, this method will do nothing.
	 */
	async closePreview(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			return;
		}
		await this.editorToolbarComponent.openDesktopPreview( 'Desktop' );
	}
}
