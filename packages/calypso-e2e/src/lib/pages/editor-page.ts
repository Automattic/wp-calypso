import { Page, ElementHandle, Response, Locator } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import { reloadAndRetry } from '../../element-helper';
import envVariables from '../../env-variables';
import {
	EditorComponent,
	EditorPublishPanelComponent,
	EditorToolbarComponent,
	EditorSettingsSidebarComponent,
	EditorGutenbergComponent,
	NavbarComponent,
	EditorBlockListViewComponent,
	EditorInlineBlockInserterComponent,
	EditorSidebarBlockInserterComponent,
	EditorWelcomeTourComponent,
	EditorWelcomeGuideComponent,
	EditorBlockToolbarComponent,
	EditorPopoverMenuComponent,
	BlockToolbarButtonIdentifier,
	CookieBannerComponent,
	EditorToolbarSettingsButton,
} from '../components';
import { BlockInserter, OpenInlineInserter } from './shared-types';
import type {
	EditorPreviewOptions,
	EditorSidebarTab,
	ArticlePrivacyOptions,
	ArticlePublishSchedule,
} from '../components/types';

const selectors = {
	// Editor
	editorTitle: '.editor-post-title__input',

	// Within the editor body.
	blockWarning: '.block-editor-warning',

	// Toast
	toastViewPostLink: '.components-snackbar__content a:text-matches("View (Post|Page)", "i")',

	// Welcome tour
	welcomeTourCloseButton: 'button[aria-label="Close Tour"]',
};

/**
 * Represents an instance of the WPCOM's Gutenberg editor page.
 */
export class EditorPage {
	private page: Page;
	private editor: EditorComponent;
	private editorPublishPanelComponent: EditorPublishPanelComponent;
	private editorToolbarComponent: EditorToolbarComponent;
	private editorSettingsSidebarComponent: EditorSettingsSidebarComponent;
	private editorGutenbergComponent: EditorGutenbergComponent;
	private editorBlockListViewComponent: EditorBlockListViewComponent;
	private editorSidebarBlockInserterComponent: EditorSidebarBlockInserterComponent;
	private editorInlineBlockInserterComponent: EditorInlineBlockInserterComponent;
	private editorWelcomeTourComponent: EditorWelcomeTourComponent;
	private editorWelcomeGuideComponent: EditorWelcomeGuideComponent;
	private editorBlockToolbarComponent: EditorBlockToolbarComponent;
	private editorPopoverMenuComponent: EditorPopoverMenuComponent;
	private cookieBannerComponent: CookieBannerComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;

		this.editor = new EditorComponent( page );

		this.editorGutenbergComponent = new EditorGutenbergComponent( page, this.editor );
		this.editorToolbarComponent = new EditorToolbarComponent( page, this.editor );
		this.editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( page, this.editor );
		this.editorPublishPanelComponent = new EditorPublishPanelComponent( page, this.editor );
		this.editorBlockListViewComponent = new EditorBlockListViewComponent( page, this.editor );
		this.editorWelcomeTourComponent = new EditorWelcomeTourComponent( page, this.editor );
		this.editorWelcomeGuideComponent = new EditorWelcomeGuideComponent( page, this.editor );
		this.editorBlockToolbarComponent = new EditorBlockToolbarComponent( page, this.editor );
		this.editorSidebarBlockInserterComponent = new EditorSidebarBlockInserterComponent(
			page,
			this.editor
		);
		this.editorInlineBlockInserterComponent = new EditorInlineBlockInserterComponent(
			page,
			this.editor
		);
		this.editorPopoverMenuComponent = new EditorPopoverMenuComponent( page, this.editor );
		this.cookieBannerComponent = new CookieBannerComponent( page, this.editor );
	}

	//#region Generic and Shell Methods

	/**
	 * Opens the "new post/page" page. By default it will open the "new post" page.
	 *
	 * Example "new post": {@link https://wordpress.com/post}
	 * Example "new page": {@link https://wordpress.com/page}
	 */
	async visit(
		type: 'post' | 'page' = 'post',
		{ siteSlug = '' }: { siteSlug?: string } = {}
	): Promise< Response | null > {
		const request = await this.page.goto( getCalypsoURL( `${ type }/${ siteSlug }` ), {
			timeout: 30 * 1000,
		} );
		await this.waitUntilLoaded();

		return request;
	}

	/**
	 * Initialization steps to ensure the page is fully loaded.
	 */
	async waitUntilLoaded(): Promise< void > {
		// When the WordPress version updates on Jetpack AT sites,
		// `wp-beta` and`wp-previous` require a database update.
		// @see https://github.com/Automattic/wp-calypso/issues/82412
		const databaseUpdateMaybeRequired =
			envVariables.ATOMIC_VARIATION === 'wp-beta' ||
			envVariables.ATOMIC_VARIATION === 'wp-previous';

		if ( databaseUpdateMaybeRequired ) {
			const loadEditorWithDatabaseUpdate = async () => {
				await this.acceptDatabaseUpdate();
				await this.waitForEditorLoadedRequests( 30 * 1000 );
			};
			await Promise.race( [
				loadEditorWithDatabaseUpdate(),
				this.waitForEditorLoadedRequests( 60 * 1000 ),
			] );
		} else {
			await this.waitForEditorLoadedRequests( 60 * 1000 );
		}

		// Dismiss the Welcome Tour.
		await this.editorWelcomeTourComponent.forceDismissWelcomeTour();

		// Accept the Cookie banner.
		await this.cookieBannerComponent.acceptCookie();
	}

	/**
	 * Waits for the editor to be fully loaded by keying off of requests.
	 *
	 * @param {number} timeout Timeout for waiting for the final requests.
	 */
	private async waitForEditorLoadedRequests( timeout: number = 60 * 1000 ): Promise< void > {
		// In a typical loading scenario, this request is one of the last to fire.
		// Lacking a perfect cross-site type (Simple/Atomic) way to check the loading state,
		// it is a fairly good stand-in.
		await Promise.all( [
			this.page.waitForURL( /(\/post\/.+|\/page\/+|\/post-new.php|\/post.php+)/, { timeout } ),
			this.page.waitForResponse( /.*posts.*/, { timeout } ),
		] );
	}

	/**
	 * Accepts the WordPress version database update prompt that can happen on lagging AT sites.
	 */
	private async acceptDatabaseUpdate(): Promise< void > {
		const databaseUpdateButton = this.page.getByRole( 'link', {
			name: 'Update WordPress Database',
		} );
		await databaseUpdateButton.click( { timeout: 30 * 1000 } );
	}

	/**
	 * Resolves with the Editor parent element locator.
	 */
	async getEditorParent() {
		return await this.editor.parent();
	}

	/**
	 * Resolves with the Editor canvas element locator.
	 *
	 * You *must* use this method if you want to select an element inside the canvas
	 * iframe. This already takes into account the parent wrapper element, so
	 * there's *no* need to to chain `getEditorParent()` before calling it.
	 */
	async getEditorCanvas() {
		return await this.editor.canvas();
	}

	/**
	 * Closes all panels that can be opened in the editor.
	 *
	 * This method will attempt to close the following panels:
	 * 	- Publish Panel (including pre-publish checklist)
	 * 	- Editor Settings Panel
	 */
	async closeAllPanels(): Promise< void > {
		await Promise.allSettled( [
			this.editorPublishPanelComponent.closePanel(),
			this.editorToolbarComponent.closeSettings(),
		] );
	}

	//#endregion

	//#region Basic Entry

	/**
	 * Select a template from the grid of options.
	 *
	 * @param {string} label Label for the template (the string underneath the preview).
	 * @param param1 Keyed object parameter.
	 * @param {number} param1.timeout Timeout to apply.
	 */
	async selectTemplate(
		label: string,
		{ timeout = envVariables.TIMEOUT }: { timeout?: number } = {}
	) {
		const editor = await this.getEditorParent();
		const inserterSelector = await editor.getByRole( 'listbox', { name: 'All' } );
		const modalSelector = await editor.getByRole( 'listbox', {
			name: 'Block patterns',
		} );
		return await inserterSelector
			.or( modalSelector )
			.getByRole( 'option', { name: label, exact: true } )
			.first()
			.click( { timeout: timeout } );
	}

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
		blockEditorSelector: string,
		{
			noSearch,
			blockFallBackName,
			blockInsertedPopupConfirmButtonSelector,
		}: {
			noSearch?: boolean;
			blockFallBackName?: string;
			blockInsertedPopupConfirmButtonSelector?: string;
		} = {}
	): Promise< ElementHandle > {
		await this.editorGutenbergComponent.resetSelectedBlock();
		await this.editorToolbarComponent.openBlockInserter();
		await this.addBlockFromInserter( blockName, this.editorSidebarBlockInserterComponent, {
			noSearch: noSearch,
			blockFallBackName: blockFallBackName,
			blockInsertedPopupConfirmButtonSelector: blockInsertedPopupConfirmButtonSelector,
		} );

		const blockHandle =
			await this.editorGutenbergComponent.getSelectedBlockElementHandle( blockEditorSelector );

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
		await openInlineInserter( await this.editor.canvas() );
		await this.addBlockFromInserter( blockName, this.editorInlineBlockInserterComponent );

		const blockHandle =
			await this.editorGutenbergComponent.getSelectedBlockElementHandle( blockEditorSelector );
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
		inserter: BlockInserter,
		{
			noSearch,
			blockFallBackName,
			blockInsertedPopupConfirmButtonSelector,
		}: {
			noSearch?: boolean;
			blockFallBackName?: string;
			blockInsertedPopupConfirmButtonSelector?: string;
		} = {}
	): Promise< Locator > {
		if ( ! noSearch ) {
			await inserter.searchBlockInserter( blockName );
		}

		const locator = await inserter.selectBlockInserterResult( blockName, { blockFallBackName } );

		if ( blockInsertedPopupConfirmButtonSelector ) {
			const editorParent = await this.editor.parent();
			const blockInsertedPopupConfirmButtonLocator = editorParent.locator(
				blockInsertedPopupConfirmButtonSelector
			);

			// Whether the popup confirm button is not deterministic.
			// If it is not present, exit early.
			try {
				await blockInsertedPopupConfirmButtonLocator.waitFor( { timeout: 100 } );
			} catch ( e ) {
				// Probably doesn't exist. That's ok.
			}

			if ( ( await blockInsertedPopupConfirmButtonLocator.count() ) > 0 ) {
				await blockInsertedPopupConfirmButtonLocator.click();
			}
		}

		return locator;
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
	async addPatternFromSidebar( patternName: string ): Promise< Locator > {
		await this.editorGutenbergComponent.resetSelectedBlock();
		await this.editorToolbarComponent.openBlockInserter();
		return await this.addPatternFromInserter(
			patternName,
			this.editorSidebarBlockInserterComponent
		);
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
	async addPatternInline( patternName: string, inserterLocator: Locator ): Promise< Locator > {
		// Perform a click action on the locator.
		await inserterLocator.click();
		// Add the specified pattern from the inserter.
		return await this.addPatternFromInserter(
			patternName,
			this.editorInlineBlockInserterComponent
		);
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
	): Promise< Locator > {
		const editorParent = await this.editor.parent();

		await inserter.searchBlockInserter( patternName );
		const locator = await inserter.selectBlockInserterResult( patternName, { type: 'pattern' } );
		const insertConfirmationToastLocator = editorParent.locator(
			`.components-snackbar__content:text('Block pattern "${ patternName }" inserted.')`
		);
		await insertConfirmationToastLocator.waitFor();
		return locator;
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

	/**
	 * Selects the matching option from the popover triggered by clicking
	 * on a block toolbar button.
	 *
	 * @param {string} name Accessible name of the element.
	 */
	async selectFromToolbarPopover( name: string ) {
		await this.editorPopoverMenuComponent.clickMenuButton( name );
	}

	/**
	 * Clicks on a button with either the name or aria-label on the
	 * editor toolbar.
	 *
	 * @param {BlockToolbarButtonIdentifier} name Object specifying either the
	 * 	text label or aria-label of the button to be clicked.
	 */
	async clickBlockToolbarButton( name: BlockToolbarButtonIdentifier ): Promise< void > {
		await this.editorBlockToolbarComponent.clickPrimaryButton( name );
	}

	/**
	 * Select the parent block of the current block using the block toolbar.
	 * This will fail and throw if the currently focused block doesn't have a parent.
	 */
	async selectParentBlock( expectedParentBlockName: string ): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
			await this.editorBlockToolbarComponent.clickParentBlockButton( expectedParentBlockName );
		} else {
			await this.editorBlockToolbarComponent.clickOptionsButton();
			await this.editorPopoverMenuComponent.clickMenuButton(
				`Select parent block (${ expectedParentBlockName })`
			);
			// It stays open on modal! We have to close it again.
			await this.editorBlockToolbarComponent.clickOptionsButton();
		}
	}

	//#endregion

	//#region Settings Sidebar

	/**
	 * Returns the locator for the root element of the settings sidebar.
	 */
	async getSettingsRoot() {
		return await this.editorSettingsSidebarComponent.getRoot();
	}

	/**
	 * Returns the locator of a section (panel body) settings sidebar.
	 *
	 * @param {string} name Name of the section.
	 */
	async getSettingsSection( name: string ) {
		return await this.editorSettingsSidebarComponent.getSection( name );
	}

	/**
	 * Opens the Settings sidebar.
	 */
	async openSettings( target: EditorToolbarSettingsButton = 'Settings' ): Promise< void > {
		await this.editorToolbarComponent.openSettings( target );
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
	 * General method to expand the named section in the settings sidebar.
	 *
	 * @param {string} name Name of the section to expand.
	 */
	async expandSection( name: string ) {
		return await this.editorSettingsSidebarComponent.expandSection( name );
	}

	/**
	 * Clicks on a button with matching accessible name in the Editor sidebar.
	 *
	 * @param {string} name Accessible name of the button.
	 */
	async clickSidebarButton( name: string ): Promise< void > {
		await this.editorSettingsSidebarComponent.clickButton( name );
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

		await this.editorSettingsSidebarComponent.expandSummary( 'Summary' );
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
		await this.editorSettingsSidebarComponent.expandSummary( 'Summary' );
		await this.editorSettingsSidebarComponent.enterUrlSlug( slug );
	}

	/**
	 * Enters SEO details on the Editor sidebar.
	 *
	 * @param param0 Keyed object parameter.
	 * @param {string} param0.title SEO title.
	 * @param {string} param0.description SEO description.
	 */
	async enterSEODetails( { title, description }: { title: string; description: string } ) {
		await this.editorSettingsSidebarComponent.enterText( title, { label: 'SEO TITLE' } );
		await this.editorSettingsSidebarComponent.enterText( description, {
			label: 'SEO DESCRIPTION',
		} );
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
	 * Returns the locator for the root element of the publish toolbar.
	 */
	async getPublishPanelRoot() {
		return await this.editorPublishPanelComponent.getRoot();
	}

	/**
	 * Publishes the post or page and returns the resulting URL.
	 *
	 * If the optional parameter `visit` parameter is specified, the page is navigated
	 * to the published article.
	 *
	 * @param {boolean} visit Whether to then visit the page.
	 * @returns {URL} Published article's URL.
	 */
	async publish( {
		visit = false,
		timeout,
	}: { visit?: boolean; timeout?: number } = {} ): Promise< URL > {
		const actionsArray = [];
		await this.editorToolbarComponent.waitForPublishButton();

		// Every publish action requires at least one click on the EditorToolbarComponent.
		actionsArray.push( this.editorToolbarComponent.clickPublish() );

		// Trigger a secondary/confirmation click if needed
		actionsArray.push( this.editorPublishPanelComponent.publish() );

		// Resolve the promises.
		const [ response ] = await Promise.all( [
			// First URL matches Atomic requests while the second matches Simple requests.
			Promise.race( [
				this.page.waitForResponse(
					async ( response ) =>
						/v2\/(posts|pages)\/[\d]+/.test( response.url() ) &&
						response.request().method() === 'POST',
					{ timeout: timeout }
				),
				this.page.waitForResponse(
					async ( response ) =>
						/.*v2\/sites\/[\d]+\/(posts|pages)\/[\d]+.*/.test( response.url() ) &&
						response.request().method() === 'PUT',
					{ timeout: timeout }
				),
			] ),
			...actionsArray,
		] );

		const json = await response.json();
		// AT and Simple sites have slightly differing response from the API.
		const publishedURL = json.link || json.body?.link;
		if ( ! publishedURL ) {
			throw new Error( 'No published article URL found in response.' );
		}

		if ( visit ) {
			await this.visitPublishedPost( publishedURL, { timeout: timeout } );
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

		await this.editorSettingsSidebarComponent.expandSummary( 'Summary' );
		await this.editorSettingsSidebarComponent.openSchedule();
		await this.editorSettingsSidebarComponent.setScheduleDetails( date );
		await this.editorSettingsSidebarComponent.closeSchedule();
	}

	/**
	 * Unpublishes the post or page by switching to draft.
	 */
	async unpublish(): Promise< void > {
		const editorParent = await this.editor.parent();
		await this.editorToolbarComponent.switchToDraft();

		// @TODO: eventually refactor this out to a ConfirmationDialogComponent.
		// Saves the draft
		await Promise.race( [ this.editorToolbarComponent.clickPublish(), this.confirmUnpublish() ] );
		// @TODO: eventually refactor this out to a EditorToastNotificationComponent.
		await editorParent.getByRole( 'button', { name: 'Dismiss this notice' } ).waitFor();
	}

	/**
	 * Confirms the unpublish action in some views
	 */
	async confirmUnpublish(): Promise< void > {
		const editorParent = await this.editor.parent();
		const okButtonLocator = editorParent.getByRole( 'button' ).getByText( 'OK' );

		if ( await okButtonLocator.count() ) {
			okButtonLocator.click();
		}
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
		const editorParent = await this.editor.parent();
		const toastLocator = editorParent.locator( selectors.toastViewPostLink );
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
	private async visitPublishedPost(
		url: string,
		{ timeout }: { timeout?: number } = {}
	): Promise< void > {
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

		await this.page.goto( url, { waitUntil: 'domcontentloaded', timeout: timeout } );

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
			await page.getByRole( 'main' ).waitFor( { timeout: timeout } );
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
			this.page.waitForNavigation( { url: '**/write/launchpad**' } ),
		] );
		const actions: Promise< unknown >[] = [ navigationPromise ];

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// Mobile viewports do not use an EditorNavSidebar.
			// Instead, the regular NavBar is used, and the
			// `<` button exits the editor.
			const navbarComponent = new NavbarComponent( this.page );
			actions.push( navbarComponent.clickEditorBackButton() );
		} else {
			actions.push( this.editorToolbarComponent.closeEditor() );
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

	/**
	 * Close the
	 */
	async closeWelcomeGuideIfNeeded(): Promise< void > {
		return this.editorWelcomeGuideComponent.closeWelcomeGuideIfNeeded();
	}

	//#endregion
}
