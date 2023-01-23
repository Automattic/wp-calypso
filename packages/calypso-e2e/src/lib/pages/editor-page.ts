import { Page, Frame, ElementHandle, Response, Locator } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { reloadAndRetry } from '../../element-helper';
import envVariables from '../../env-variables';
import {
	EditorPublishPanelComponent,
	EditorNavSidebarComponent,
	EditorToolbarComponent,
	EditorSettingsSidebarComponent,
	EditorGutenbergComponent,
	NavbarComponent,
	EditorBlockListViewComponent,
	EditorInlineBlockInserterComponent,
	EditorSidebarBlockInserterComponent,
	EditorWelcomeTourComponent,
	EditorBlockToolbarComponent,
} from '../components';
import { BlockInserter, OpenInlineInserter } from './shared-types';
import type { SiteType } from '../../lib/utils';
import type {
	EditorPreviewOptions,
	EditorSidebarTab,
	ArticlePrivacyOptions,
	ArticlePublishSchedule,
} from '../components/types';

const selectors = {
	// iframe and editor
	editorFrame: 'iframe.is-loaded', // Gutenframe/Calypsofy iframe, only on Simple sites.
	editor: 'body.block-editor-page',
	editorCanvasFrame: 'iframe[name="editor-canvas"]', // Editor canvas (inner) iframe introduced in Gutenberg 14.9.1 for block-based themes.

	editorTitle: '.editor-post-title__input',

	// Within the editor body.
	blockWarning: '.block-editor-warning',

	// Toast
	toastViewPostLink: '.components-snackbar__content a:text-matches("View (Post|Page)", "i")',

	// Welcome tour
	welcomeTourCloseButton: 'button[aria-label="Close Tour"]',
};
const EXTENDED_TIMEOUT = 30 * 1000;

/**
 * Represents an instance of the WPCOM's Gutenberg editor page.
 */
export class EditorPage {
	private page: Page;
	private editorWindow: Locator;
	private editorCanvas: Locator;
	private target: SiteType;
	private editorPublishPanelComponent: EditorPublishPanelComponent;
	private editorNavSidebarComponent: EditorNavSidebarComponent;
	private editorToolbarComponent: EditorToolbarComponent;
	private editorSettingsSidebarComponent: EditorSettingsSidebarComponent;
	private editorGutenbergComponent: EditorGutenbergComponent;
	private editorBlockListViewComponent: EditorBlockListViewComponent;
	private editorSidebarBlockInserterComponent: EditorSidebarBlockInserterComponent;
	private editorInlineBlockInserterComponent: EditorInlineBlockInserterComponent;
	private editorWelcomeTourComponent: EditorWelcomeTourComponent;
	private editorBlockToolbarComponent: EditorBlockToolbarComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param param0 Keyed object parameter.
	 * @param param0.target Target editor type. Defaults to 'simple'.
	 * @param param0.blockTheme Whether block-based theme is used. Defaults to 'false'.
	 */
	constructor(
		page: Page,
		{ target = 'simple', blockTheme = false }: { target?: SiteType; blockTheme?: boolean } = {}
	) {
		// The first step is to determine whether the test site is running a
		// Gutenframe, otherwise known as a Calypsofy iframe.
		// Typically, a Gutenframe is found on Simple sites and encapsulates the
		// entire editor window.
		// Atomic sites typically do not feature a Gutenframe and thus the editor
		// window is exposed in the DOM.
		// For both Simple and Atomic, the relevant `body` root element is used when resolving
		// the Locator. This is to present a unified behavior when other methods reference the
		// `editorWindow`.
		if ( target === 'atomic' ) {
			this.editorWindow = page.locator( selectors.editor );
		} else {
			this.editorWindow = page.frameLocator( selectors.editorFrame ).locator( selectors.editor );
		}

		// The second step is to locate the iframe that exists within the
		// editor canvas as of Gutenberg 14.9.1 when using newer block-based themes.
		// If the parameter `blockTheme` is true, the editor canvas is hidden inside a new
		// iframe and must be pierced to be visible.
		if ( blockTheme ) {
			this.editorCanvas = this.editorWindow
				.frameLocator( selectors.editorCanvasFrame )
				.locator( 'body' );
		} else {
			this.editorCanvas = this.editorWindow;
		}

		this.page = page;
		this.target = target;

		// Instantiate the subcomponent classes that build up the editor experience.
		this.editorGutenbergComponent = new EditorGutenbergComponent(
			page,
			this.editorWindow,
			this.editorCanvas
		);
		this.editorToolbarComponent = new EditorToolbarComponent( page, this.editorWindow );
		this.editorSettingsSidebarComponent = new EditorSettingsSidebarComponent(
			page,
			this.editorWindow
		);
		this.editorPublishPanelComponent = new EditorPublishPanelComponent( page, this.editorWindow );
		this.editorNavSidebarComponent = new EditorNavSidebarComponent( page, this.editorWindow );
		this.editorBlockListViewComponent = new EditorBlockListViewComponent( page, this.editorWindow );
		this.editorWelcomeTourComponent = new EditorWelcomeTourComponent( page, this.editorWindow );
		this.editorBlockToolbarComponent = new EditorBlockToolbarComponent( page, this.editorWindow );
		this.editorSidebarBlockInserterComponent = new EditorSidebarBlockInserterComponent(
			page,
			this.editorWindow
		);
		this.editorInlineBlockInserterComponent = new EditorInlineBlockInserterComponent(
			page,
			this.editorWindow
		);
	}

	//#region Generic and Shell Methods

	/**
	 * Opens the "new post/page" page. By default it will open the "new post" page.
	 *
	 * Example "new post": {@link https://wordpress.com/post}
	 * Example "new page": {@link https://wordpress.com/page}
	 */
	async visit( type: 'post' | 'page' = 'post' ): Promise< Response | null > {
		const request = await this.page.goto( getCalypsoURL( type ), { timeout: 30 * 1000 } );
		await this.waitUntilLoaded();

		return request;
	}

	/**
	 * Initialization steps to ensure the page is fully loaded.
	 *
	 * @returns {Promise<Frame>} iframe holding the editor.
	 */
	async waitUntilLoaded(): Promise< void > {
		// In a typical loading scenario, this request is one of the last to fire.
		// Lacking a perfect cross-site type (Simple/Atomic) way to check the loading state,
		// it is a fairly good stand-in.
		await this.page.waitForResponse( /.*posts.*/, { timeout: EXTENDED_TIMEOUT } );

		// Dismiss the Welcome Tour.
		await this.editorWelcomeTourComponent.forceDismissWelcomeTour();
	}

	// TODO: in the future, this should replace the handle method above, as everything should be based on locators.
	/**
	 * Get a pointer to the top-level editor locator.
	 * This allows you a frame-safe way to start creating locators for other actions with the editor.
	 *
	 * @returns A pointer to frame-safe, top-level locator within the editor.
	 */
	getEditorWindowLocator(): Locator {
		return this.editorWindow;
	}

	/**
	 * Returns the locator to the editor canvas.
	 *
	 * Editor canvas here refers only to the visible block editor portion.
	 * The editor canvas may be accessible directly (non-block-based theme) or
	 * may be wrapped inside an iframe (block-based theme).
	 *
	 * @returns {Locator} Locator to the Editor Canvas.
	 */
	getEditorCanvasLocator(): Locator {
		return this.editorCanvas;
	}

	/**
	 * Returns a locator to the element specified by the selector.
	 *
	 * This method first looks into the editor window for a matching element
	 * to the selector. If no elements are found, this method then looks into
	 * the editor canvas.
	 *
	 * If no elements matching the selector is found anywhere, this method
	 * returns null.
	 *
	 * The distinction of editor window and editor canvas exists due to the
	 * presence of inner iframes for block-based themes as of Gutenberg 14.9.1.
	 *
	 * @param {string} selector Selector to an element.
	 * @returns {Promise<Locator|null>} Locator if this method finds a match. null otherwise.
	 */
	async getLocatorToSelector( selector: string ): Promise< Locator | null > {
		if ( await this.editorWindow.locator( selector ).count() ) {
			return this.editorWindow.locator( selector );
		}
		if ( await this.editorCanvas.locator( selector ).count() ) {
			return this.editorCanvas.locator( selector );
		}
		return null;
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
		await Promise.allSettled( [
			this.editorPublishPanelComponent.closePanel(),
			this.editorToolbarComponent.closeNavSidebar(),
			this.editorToolbarComponent.closeSettings(),
		] );
	}

	/**
	 * Returns a locator to the provided selector.
	 *
	 * @param {string} selector Element selector.
	 * @returns {Locator} Locator corresponding to the selector.
	 */
	getLocator( selector: string ): Locator {
		return this.editorWindow.locator( selector );
	}

	//#endregion

	//#region Basic Entry

	/**
	 * Enters the text into the title block and verifies the result.
	 *
	 * @param {string} title Text to be used as the title.
	 * @throws {Error} If entered title does not match.
	 */
	async enterTitle( title: string ): Promise< void > {
		await this.editorGutenbergComponent.enterTitle( title );
		const enteredTitle = await this.editorGutenbergComponent.getTitle();

		const sanitizedTitle = title.trim();
		if ( enteredTitle !== sanitizedTitle ) {
			throw new Error(
				`Failed to verify title: got ${ enteredTitle }, expected ${ sanitizedTitle }`
			);
		}
	}

	/**
	 * Enters text into the body, splitting newlines into new pragraph blocks as necessary. The entered text is then read back and checked.
	 *
	 * @param {string} text Text to be entered into the paragraph blocks, separated by newline characters.
	 */
	async enterText( text: string ): Promise< void > {
		await this.editorGutenbergComponent.enterText( text );
		const enteredText = await this.editorGutenbergComponent.getText();

		if ( text !== enteredText ) {
			`Failed to verify entered text: got ${ enteredText }, expected ${ text }`;
		}
	}

	/**
	 * Returns the text found in the editor.
	 *
	 * @returns {Promise<string>} String representing text entered in each paragraph block.
	 */
	async getText(): Promise< string > {
		return await this.editorGutenbergComponent.getText();
	}

	//#endregion

	//#region Block and Pattern Insertion

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
	 * The block editor selector should select the top level element of a block in the editor.
	 * For reference, this element will almost always have the ".wp-block" class.
	 * We recommend using the aria-label for the selector, e.g. '[aria-label="Block: Quote"]'.
	 *
	 * @param {string} blockName Name of the block to be inserted.
	 */
	async addBlockFromSidebar(
		blockName: string,
		blockEditorSelector: string
	): Promise< ElementHandle > {
		await this.editorGutenbergComponent.resetSelectedBlock();
		await this.editorToolbarComponent.openBlockInserter();
		await this.addBlockFromInserter( blockName, this.editorSidebarBlockInserterComponent );

		const blockHandle = await this.editorGutenbergComponent.getSelectedBlockElementHandle(
			blockEditorSelector
		);

		// Dismiss the block inserter if viewport is larger than mobile to
		// ensure no interference from the block inserter in subsequent actions on the editor.
		// In mobile, the block inserter will typically auto-close, but sometimes there can
		// be issues with auto-close.
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await this.editorToolbarComponent.closeBlockInserter();
		} else {
			await this.editorSidebarBlockInserterComponent.closeBlockInserter();
		}

		// Return an ElementHandle pointing to the block for compatibility
		// with existing specs.
		return blockHandle;
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
	 * @returns An element handle to the added block.
	 */
	async addBlockInline(
		blockName: string,
		blockEditorSelector: string,
		openInlineInserter: OpenInlineInserter
	): Promise< ElementHandle > {
		// First, launch the inline inserter in the way expected by the script.
		await openInlineInserter( this.editorWindow );
		await this.addBlockFromInserter( blockName, this.editorInlineBlockInserterComponent );

		const blockHandle = await this.editorGutenbergComponent.getSelectedBlockElementHandle(
			blockEditorSelector
		);
		// Return an ElementHandle pointing to the block for compatibility
		// with existing specs.
		return blockHandle;
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
	 * Adds a pattern from the sidebar block inserter panel.
	 *
	 * The name is expected to be formatted in the same manner as it
	 * appears on the label when visible in the block inserter panel.
	 *
	 * Example:
	 * 		- Two images side by side
	 *
	 * @param {string} patternName Name of the pattern to insert.
	 */
	async addPatternFromSidebar( patternName: string ): Promise< void > {
		await this.editorGutenbergComponent.resetSelectedBlock();
		await this.editorToolbarComponent.openBlockInserter();
		await this.addPatternFromInserter( patternName, this.editorSidebarBlockInserterComponent );
	}

	/**
	 * Adds a pattern from the inline block inserter panel.
	 *
	 * Because there are so many different ways to open the inline inserter,
	 * this function accepts a Locator to the element that should open the inserter.
	 *
	 * The name is expected to be formatted identically (including case) to how it
	 * appears on the label when viewing in the block inserter panel.
	 *
	 * @example
	 * 	- About Me Card
	 * 	- Contact Info with Map
	 * @param {string} patternName Name of the pattern to insert as it matches the label in the inserter.
	 * @param {Locator} inserterLocator Locator to the element that will open the pattern/block inserter when clicked.
	 */
	async addPatternInline( patternName: string, inserterLocator: Locator ): Promise< void > {
		// Perform a click action on the locator.
		await inserterLocator.click();
		// Add the specified pattern from the inserter.
		await this.addPatternFromInserter( patternName, this.editorInlineBlockInserterComponent );
	}

	/**
	 * Shared submethod to insert a pattern from a block inserter (sidebar or inline).
	 *
	 * @param {string} patternName Name of the pattern.
	 * @param {BlockInserter} inserter Block inserter component.
	 */
	private async addPatternFromInserter(
		patternName: string,
		inserter: BlockInserter
	): Promise< void > {
		await inserter.searchBlockInserter( patternName );
		await inserter.selectBlockInserterResult( patternName, { type: 'pattern' } );
		const insertConfirmationToastLocator = this.editorWindow.locator(
			`.components-snackbar__content:text('Block pattern "${ patternName }" inserted.')`
		);
		await insertConfirmationToastLocator.waitFor();
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
	 * Move the currently selected block up one position with the block toolbar.
	 */
	async moveBlockUp(): Promise< void > {
		await this.editorBlockToolbarComponent.moveUp();
	}

	/**
	 * Move the currently selected block down one position with the block toolbar.
	 */
	async moveBlockDown(): Promise< void > {
		await this.editorBlockToolbarComponent.moveDown();
	}

	//#endregion

	//#region Settings Sidebar

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
			await this.editorSettingsSidebarComponent.closeSidebarForMobile();
		} else {
			await this.editorToolbarComponent.closeSettings();
		}
	}

	/**
	 * Clicks and activates the given tab in the Editor Settings sidebar.
	 *
	 * @param {EditorSidebarTab} tab Name of the tab to activate.
	 */
	async clickSettingsTab( tab: EditorSidebarTab ): Promise< void > {
		await this.editorSettingsSidebarComponent.clickTab( tab );
	}

	/**
	 * Sets the article's privacy/visibility option.
	 *
	 * @param {ArticlePrivacyOptions} visibility Visibility option for the article.
	 * @param param1 Object parameters.
	 * @param {string} param1.password Password for the post.
	 */
	async setArticleVisibility(
		visibility: ArticlePrivacyOptions,
		{ password }: { password?: string }
	): Promise< void > {
		await Promise.race( [
			this.editorSettingsSidebarComponent.clickTab( 'Page' ),
			this.editorSettingsSidebarComponent.clickTab( 'Post' ),
		] );

		await this.editorSettingsSidebarComponent.expandSection( 'Summary' );
		await this.editorSettingsSidebarComponent.openVisibilityOptions();
		await this.editorSettingsSidebarComponent.selectVisibility( visibility, {
			password: password,
		} );
		await this.editorSettingsSidebarComponent.closeVisibilityOptions();
	}

	/**
	 * View revisions for the article.
	 */
	async viewRevisions(): Promise< void > {
		await Promise.race( [
			this.editorSettingsSidebarComponent.clickTab( 'Page' ),
			this.editorSettingsSidebarComponent.clickTab( 'Post' ),
		] );
		await this.editorSettingsSidebarComponent.showRevisions();
	}

	/**
	 * Select a category for the article.
	 *
	 * @param {string} name Name of the category.
	 */
	async selectCategory( name: string ): Promise< void > {
		await Promise.race( [
			this.editorSettingsSidebarComponent.clickTab( 'Page' ),
			this.editorSettingsSidebarComponent.clickTab( 'Post' ),
		] );
		await this.editorSettingsSidebarComponent.expandSection( 'Categories' );
		await this.editorSettingsSidebarComponent.checkCategory( name );
	}

	/**
	 * Adds the given tag to the article.
	 *
	 * @param {string} tag Tag to be added to article.
	 */
	async addTag( tag: string ): Promise< void > {
		await Promise.race( [
			this.editorSettingsSidebarComponent.clickTab( 'Page' ),
			this.editorSettingsSidebarComponent.clickTab( 'Post' ),
		] );
		await this.editorSettingsSidebarComponent.expandSection( 'Tags' );
		await this.editorSettingsSidebarComponent.enterTag( tag );
	}

	/**
	 * Sets the URL slug.
	 *
	 * @param {string} slug Desired URL slug.
	 */
	async setURLSlug( slug: string ): Promise< void > {
		await Promise.race( [
			this.editorSettingsSidebarComponent.clickTab( 'Page' ),
			this.editorSettingsSidebarComponent.clickTab( 'Post' ),
		] );
		await this.editorSettingsSidebarComponent.expandSection( 'Summary' );
		await this.editorSettingsSidebarComponent.enterUrlSlug( slug );
	}

	//#endregion

	//#region List View

	/**
	 * Opens the list view.
	 */
	async openListView(): Promise< void > {
		await this.editorToolbarComponent.openListView();
	}

	/**
	 * Closes the list view.
	 */
	async closeListView(): Promise< void > {
		await this.editorToolbarComponent.closeListView();
	}

	/**
	 * In the list view, click on the first block of a given type (e.g. "Heading").
	 *
	 * @param blockName Name of the block type to find and click (e.g. "Heading").
	 */
	async clickFirstListViewEntryByType( blockName: string ): Promise< void > {
		await this.editorBlockListViewComponent.clickFirstBlockOfType( blockName );
	}

	//#endregion

	//#region Publish, Draft & Schedule

	/**
	 * Publishes the post or page and returns the resulting URL.
	 *
	 * If the optional parameter `visit` parameter is specified, the page is navigated
	 * to the published article.
	 *
	 * @param {boolean} visit Whether to then visit the page.
	 * @returns {URL} Published article's URL.
	 */
	async publish( { visit = false }: { visit?: boolean } = {} ): Promise< URL > {
		const publishButtonText = await this.editorToolbarComponent.getPublishButtonText();
		const actionsArray = [];

		// Playwright does not have a way to differentiate
		// between GET and POST requests. However, a new post
		// has a post number following the article type.
		// By matching on the regex we can filter out
		// GET requests to the endpoint, focusing only on POST requests.
		if ( this.target === 'atomic' ) {
			actionsArray.push( this.page.waitForResponse( /v2\/(posts|pages)\/[\d]+/ ) );
		} else {
			actionsArray.push( this.page.waitForResponse( /sites\/[\d]+\/(posts|pages)\/[\d]+.*/ ) );
		}

		// Every publish action requires at least one click on the EditorToolbarComponent.
		actionsArray.push( this.editorToolbarComponent.clickPublish() );

		// Determine whether the post/page is yet to be published or the post/page
		// is merely being updated.
		// If not yet published, a second click on the EditorPublishPanelComponent
		// is added to the array of actions.
		if ( publishButtonText.toLowerCase() !== 'update' ) {
			actionsArray.push( this.editorPublishPanelComponent.publish() );
		}

		// Resolve the promises.
		const [ response ] = await Promise.all( actionsArray );

		if ( ! response ) {
			throw new Error( 'No response received from `publish` method.' );
		}

		const json = await response.json();

		let publishedURL: string;
		if ( this.target === 'atomic' ) {
			publishedURL = json.link;
		} else {
			publishedURL = json.body.link;
		}

		if ( ! publishedURL ) {
			throw new Error( 'No published article URL found in response.' );
		}

		if ( visit ) {
			await this.visitPublishedPost( publishedURL );
		}

		return new URL( publishedURL );
	}

	/**
	 * Schedules an article.
	 *
	 * This method requires the Editor Settings sidebar to be open.
	 */
	async schedule( date: ArticlePublishSchedule ): Promise< void > {
		await Promise.race( [
			this.editorSettingsSidebarComponent.clickTab( 'Page' ),
			this.editorSettingsSidebarComponent.clickTab( 'Post' ),
		] );

		await this.editorSettingsSidebarComponent.expandSection( 'Summary' );
		await this.editorSettingsSidebarComponent.openSchedule();
		await this.editorSettingsSidebarComponent.setScheduleDetails( date );
		await this.editorSettingsSidebarComponent.closeSchedule();
	}

	/**
	 * Unpublishes the post or page by switching to draft.
	 */
	async unpublish(): Promise< void > {
		await this.editorToolbarComponent.switchToDraft();

		// @TODO: eventually refactor this out to a ConfirmationDialogComponent.
		await this.editorWindow.getByRole( 'button' ).getByText( 'OK' ).click();
		// @TODO: eventually refactor this out to a EditorToastNotificationComponent.
		await this.editorWindow.getByRole( 'button', { name: 'Dismiss this notice' } ).waitFor();
	}

	/**
	 * Obtains the published article's URL from the post-publish toast.
	 *
	 * This method is only able to obtain the published article's URL if the
	 * post-publish toast is still visible on the page.
	 *
	 * @deprecated Please use the return value from `EditorPage.publish` where possible.
	 * @returns {URL} Published article's URL.
	 */
	async getPublishedURLFromToast(): Promise< URL > {
		const toastLocator = this.editorWindow.locator( selectors.toastViewPostLink );
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
		this.allowLeavingWithoutSaving();

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

	//#endregion

	//#region Previews

	/**
	 * Launches the Preview as mobile viewport.
	 *
	 * For Mobile viewports, this method will return a reference to a popup Page.
	 * For Desktop and Tablet viewports, an error is thrown.
	 *
	 * @returns {Promise<Page>} Handler for the popup page.
	 * @throws {Error} If the current viewport is not of Mobile.
	 */
	async previewAsMobile(): Promise< Page > {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			throw new Error(
				`This method only works in mobile viewport, current viewport: ${ envVariables.VIEWPORT_NAME } `
			);
		}
		return await this.editorToolbarComponent.openMobilePreview();
	}

	/**
	 * Launches the Preview as non-mobile viewport.
	 *
	 * For Desktop and Tablet viewports, this method will not return any value.
	 * For Mobile viewport, an error is thrown.
	 *
	 * @param {EditorPreviewOptions} target Target preview size.
	 * @returns {Page|void} Handler for the Page object on mobile. Void otherwise.
	 * @throws {Error} If the current viewport is not of Desktop or Tablet.
	 */
	async previewAsDesktop( target: EditorPreviewOptions ): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			throw new Error(
				`This method only works in non-mobile viewport, current viewport: ${ envVariables.VIEWPORT_NAME } `
			);
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

	//#endregion

	//#region Misc

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
		// There are three different places to return to,
		// depending on how the editor was entered.
		const navigationPromise = Promise.race( [
			this.page.waitForNavigation( { url: '**/home/**' } ),
			this.page.waitForNavigation( { url: '**/posts/**' } ),
			this.page.waitForNavigation( { url: '**/pages/**' } ),
			this.page.waitForNavigation( { url: '**/wp-admin/edit**' } ),
		] );
		const actions: Promise< unknown >[] = [ navigationPromise ];

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// Mobile viewports do not use an EditorNavSidebar.
			// Instead, the regular NavBar is used, and the
			// `My Sites` button exits the editor.
			const navbarComponent = new NavbarComponent( this.page );
			actions.push( navbarComponent.clickMySites() );
		} else {
			actions.push(
				this.editorToolbarComponent.openNavSidebar(),
				this.editorNavSidebarComponent.exitEditor()
			);
		}

		// Perform the actions and resolve promises.
		await Promise.all( actions );
	}

	/**
	 * Sets up a handler to accept the leave without saving warning.
	 */
	allowLeavingWithoutSaving(): void {
		this.page.once( 'dialog', async ( dialog ) => {
			await dialog.accept();
		} );
	}

	/**
	 * Checks whether the editor has any block warnings/errors displaying.
	 *
	 * @returns {Promise<boolean>} True if there are block warnings/errors.
	 * False otherwise.
	 */
	async editorHasBlockWarnings(): Promise< boolean > {
		return await this.editorGutenbergComponent.editorHasBlockWarning();
	}

	/**
	 * Open the editor options menu.
	 */
	async openEditorOptionsMenu(): Promise< void > {
		return this.editorToolbarComponent.openMoreOptionsMenu();
	}

	//#endregion
}
