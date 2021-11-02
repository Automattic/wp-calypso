import assert from 'assert';
import { resolve } from 'path/posix';
import { Page, Frame, ElementHandle } from 'playwright';
import { getTargetDeviceName } from '../../browser-helper';
import { NavbarComponent } from '../components';

type ClickOptions = Parameters< Frame[ 'click' ] >[ 1 ];
type PreviewOptions = 'Desktop' | 'Mobile' | 'Tablet';

const selectors = {
	// iframe and editor
	editorFrame: '.calypsoify.is-iframe iframe.is-loaded',
	editorTitle: '.editor-post-title__input',

	// Block inserter
	blockInserterToggle: 'button.edit-post-header-toolbar__inserter-toggle',
	blockInserterPanel: '.block-editor-inserter__content',
	blockSearch: '[placeholder="Search"]',
	blockInserterResultItem: '.block-editor-block-types-list__list-item',

	// Within the editor body.
	blockAppender: '.block-editor-default-block-appender',
	paragraphBlocks: 'p.block-editor-rich-text__editable',
	blockWarning: '.block-editor-warning',

	// Top bar selectors.
	postToolbar: '.edit-post-header',
	settingsToggle: '[aria-label="Settings"]',
	saveDraftButton: '.editor-post-save-draft',
	previewButton: ':is(button:text("Preview"), a:text("Preview"))',
	publishButton: ( parentSelector: string ) =>
		`${ parentSelector } button:text("Publish")[aria-disabled=false]`,

	// Settings panel.
	settingsPanel: '.interface-complementary-area',

	// Publish panel (including post-publish)
	publishPanel: '.editor-post-publish-panel',
	viewButton: '.editor-post-publish-panel a:has-text("View")',
	addNewButton: '.editor-post-publish-panel a:text-matches("Add a New P(ost|age)")',
	closePublishPanel: 'button[aria-label="Close panel"]',

	// Welcome tour
	welcomeTourCloseButton: 'button[aria-label="Close Tour"]',

	// Block editor sidebar
	desktopEditorSidebarButton: 'button[aria-label="Block editor sidebar"]:visible',
	desktopDashboardLink: 'a[aria-description="Returns to the dashboard"]:visible',
	mobileDashboardLink: 'a[aria-current="page"]:visible',

	// Preview
	previewMenuItem: ( target: PreviewOptions ) => `button[role="menuitem"] span:text("${ target }")`,
	previewPane: ( target: PreviewOptions ) => `.is-${ target.toLowerCase() }-preview`,
};

/**
 * Represents an instance of the WPCOM's Gutenberg editor page.
 */
export class GutenbergEditorPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Initialization steps to ensure the page is fully loaded.
	 *
	 * @returns {Promise<Frame>} iframe holding the editor.
	 */
	async waitUntilLoaded(): Promise< Frame > {
		await this.page.waitForLoadState( 'load' );

		const frame = await this.getEditorFrame();
		// Traditionally we try to avoid waits not related to the current flow. However, we need a stable way to identify loading being done.
		// NetworkIdle takes too long here, so the most reliable alternative is the title being visible.
		await frame.waitForSelector( selectors.editorTitle );

		await this.dismissWelcomeTourIfPresent();
		return frame;
	}

	/**
	 * Dismisses the Welcome Tour (card) if it is present.
	 */
	async dismissWelcomeTourIfPresent(): Promise< void > {
		const frame = await this.getEditorFrame();
		try {
			await frame.click( selectors.welcomeTourCloseButton, { timeout: 5 * 1000 } );
		} catch ( err ) {
			// noop - welcome tour was not found, which is great.
		}
	}

	/**
	 * Return the editor iframe.
	 *
	 * @returns {Promise<Frame>} iframe holding the editor.
	 */
	async getEditorFrame(): Promise< Frame > {
		const elementHandle = await this.page.waitForSelector( selectors.editorFrame, {
			timeout: 105 * 1000,
			state: 'attached',
		} );
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

		// Click on the editor title. This has the effect of dismissing the block inserter
		// if open, and restores focus back to the editor root container, allowing insertion
		// of blocks.
		await frame.click( selectors.editorTitle );
		await this.openBlockInserter();
		await frame.fill( selectors.blockSearch, blockName );
		await frame.click( `${ selectors.blockInserterResultItem } span:text("${ blockName }")` );
		// Confirm the block has been added to the editor body.
		return await frame.waitForSelector( `${ blockEditorSelector }.is-selected` );
	}

	/**
	 * Open the block inserter panel.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openBlockInserter(): Promise< void > {
		const frame = await this.getEditorFrame();

		await frame.click( selectors.blockInserterToggle );
		await frame.waitForSelector( selectors.blockInserterPanel );
	}

	/**
	 * Opens the settings sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openSettings(): Promise< void > {
		const frame = await this.getEditorFrame();

		const isSidebarOpen = await frame.$eval( selectors.settingsToggle, ( element ) =>
			element.classList.contains( 'is-pressed' )
		);
		if ( ! isSidebarOpen ) {
			await frame.click( selectors.settingsToggle );
		}
		const settingsToggle = await frame.waitForSelector( selectors.settingsToggle );
		await frame.waitForFunction(
			( element ) => element.getAttribute( 'aria-pressed' ) === 'true',
			settingsToggle
		);
	}

	/**
	 * Publishes the post or page.
	 *
	 * @param {boolean} visit Whether to then visit the page.
	 * @returns {Promise<void} No return value.
	 */
	async publish( {
		visit = false,
		saveDraft = false,
	}: { visit?: boolean; saveDraft?: boolean } = {} ): Promise< string > {
		const frame = await this.getEditorFrame();

		if ( saveDraft ) {
			await this.saveDraft();
		}

		await frame.click( selectors.publishButton( selectors.postToolbar ) );
		await frame.click( selectors.publishButton( selectors.publishPanel ) );
		const viewPublishedArticleButton = await frame.waitForSelector( selectors.viewButton );
		const publishedURL = ( await viewPublishedArticleButton.getAttribute( 'href' ) ) as string;

		if ( visit ) {
			await this._visitPublishedEntryFromPublishPane();
		}
		return publishedURL;
	}

	/**
	 * Creates a new page/post using the post-publish panel.
	 *
	 * @param options will be forwarded to the button click action
	 */
	async postPublishAddNewItem( options: ClickOptions = {} ): Promise< void > {
		const frame = await this.getEditorFrame();
		await frame.waitForSelector( selectors.publishPanel );
		await frame.click( selectors.addNewButton, options );
	}

	/**
	 * Saves the currently open post as draft.
	 */
	async saveDraft(): Promise< void > {
		const frame = await this.getEditorFrame();

		await frame.click( selectors.saveDraftButton );
		// Once the Save draft button is clicked, buttons on the post toolbar
		// are disabled while the post is saved. Wait for the state of
		// Publish button to return to 'enabled' before proceeding.
		await frame.waitForSelector( selectors.publishButton( selectors.postToolbar ) );
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
	async _visitPublishedEntryFromPublishPane(): Promise< void > {
		const frame = await this.getEditorFrame();

		await Promise.all( [ this.page.waitForNavigation(), frame.click( selectors.viewButton ) ] );
		await this.page.waitForLoadState( 'networkidle' );
	}

	/**
	 * Opens the Nav Sidebar on the left hand side.
	 *
	 * On desktop sized viewport, this will open the editor block sidebar listing recently edited posts and drafts.
	 *
	 * On mobile sized viewport, this method will pass through.
	 *
	 */
	async openNavSidebar(): Promise< void > {
		const frame = await this.getEditorFrame();
		if ( getTargetDeviceName() === 'desktop' ) {
			await frame.click( selectors.desktopEditorSidebarButton );
		}
	}

	/**
	 * Returns to the Posts > All Posts view in Calypso.
	 *
	 * On desktop sized viewport, this method clicks on the `< All Posts` link in the block editor sidebar.
	 * Note, for desktop the editor sidebar must be open. To open the sidebar, call `openNavSidebar` method.
	 *
	 * On mobile sized viewport, this method clicks on Navbar > My Sites.
	 *
	 * For both cases the esulting page will be the `My Home` page.
	 */
	async returnToHomeDashboard(): Promise< void > {
		const frame = await this.getEditorFrame();
		const navbarComponent = new NavbarComponent( this.page );
		const actions: unknown[] = [
			this.page.waitForNavigation( { url: '**/home/**', waitUntil: 'load' } ),
		];

		if ( getTargetDeviceName() === 'desktop' ) {
			actions.push( frame.click( selectors.desktopDashboardLink ) );
		} else {
			actions.push( navbarComponent.clickMySites() );
		}

		await Promise.all( actions );
	}

	/* Previews */

	/**
	 * Click on the `Preview` button on the editor toolbar.
	 *
	 * This method interacts with the mobile implementation of the editor preview,
	 * which:
	 * 	1. launch a new tab.
	 * 	2. load the preview.
	 *
	 * This method will throw if used in a desktop environment.
	 *
	 * @throws {Error} If environment is not 'mobile'.
	 */
	async openPreviewAsMobile(): Promise< Page > {
		if ( getTargetDeviceName() !== 'mobile' ) {
			throw new Error( 'This method only works in a mobile environment.' );
		}
		const frame = await this.getEditorFrame();
		const [ popup ] = await Promise.all( [
			this.page.waitForEvent( 'popup' ),
			frame.click( selectors.previewButton ),
		] );
		await popup.waitForLoadState( 'load' );
		return popup;
	}

	/**
	 * Click on the `Preview` button on the editor toolbar, then select requested the preview option.
	 *
	 * This method interacts with the non-mobile implementation of the editor preview,
	 * which applies an attribute to the editor to simulate target device.
	 *
	 *
	 * @param {PreviewOptions} target Preview option to be selected.
	 * @throws {Error} If environment is 'mobile'.
	 */
	async openPreviewAsDesktop( target: PreviewOptions ): Promise< void > {
		if ( getTargetDeviceName() === 'mobile' ) {
			throw new Error( 'This method only works in a non-mobile environment.' );
		}
		const frame = await this.getEditorFrame();
		await frame.click( selectors.previewButton );
		await frame.click( selectors.previewMenuItem( target ) );
		await frame.waitForSelector( selectors.previewPane( target ) );
	}

	/**
	 * Terminates the Post Preview mode.
	 *
	 * This method will click on the Preview button if required, then select the `Desktop` entry,
	 * which is the default view setting when the editor is opened initially.
	 *
	 * @throws {Error} If environment is 'mobile'.
	 */
	async closePreview(): Promise< void > {
		if ( getTargetDeviceName() === 'mobile' ) {
			throw new Error( ' This method only works in a non-mobile environment.' );
		}
		const frame = await this.getEditorFrame();

		const previewButtonHandle = await frame.waitForSelector( selectors.previewButton );
		// Check if the Preview button has been clicked and that menu options are showing.
		// If required, click and show the menu items so that 'Desktop' can be clicked.
		if ( ( await previewButtonHandle.getAttribute( 'aria-expanded' ) ) === 'false' ) {
			await frame.click( selectors.previewButton );
		}
		// Select 'Desktop'.
		await frame.click( selectors.previewMenuItem( 'Desktop' ) );
		// Dismiss the Preview button.
		await previewButtonHandle.click();

		// Ensure the preview menu is closed and that preview settings are back to default.
		await frame.waitForSelector( 'button[aria-expanded=false]' );
		await frame.waitForSelector( selectors.previewPane( 'Desktop' ) );
	}
}
