import { Locator, Page } from 'playwright';
import envVariables from '../../env-variables';
import { translateFromPage } from '../utils';
import { EditorComponent } from './editor-component';
import type { EditorPreviewOptions, EditorToolbarSettingsButton } from './types';

const panel = '[aria-label="Editor top bar"]';
const moreOptionsLabel = 'Options';
const selectors = {
	// Block Inserter
	// Note the partial class match. This is to support site and post editor. We can't use aria-label because of i18n. :(
	blockInserterButton: `${ panel } button[class*="inserter-toggle"]`,

	// Draft
	switchToDraftButton: `${ panel } button.editor-post-switch-to-draft`,

	// Preview
	previewButton: `${ panel } :text("View"):visible, [aria-label="View"]:visible`,

	// Post status
	postStatusButton: '.editor-post-status > button',

	desktopPreviewMenuItem: ( target: EditorPreviewOptions ) =>
		`button[role*="menuitem"] span:text-is("${ target }")`,
	previewPane: '.edit-post-visual-editor',

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
	documentActionsDropdownShowAll: '.popover-slot .edit-site-template-details__show-all-button',

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
	private async translateFromPage( string: string, context?: string ): Promise< string > {
		const editorParent = await this.editor.parent();
		return translateFromPage( editorParent, string, context );
	}

	/* General helper */

	/**
	 * Given a Locator, determines whether the target button/toggle is
	 * in an expanded state.
	 *
	 * If the toggle is in the on state or otherwise in an expanded
	 * state, this method will return true. Otherwise, false.
	 *
	 * @param {Locator} target Target button.
	 * @returns {Promise<boolean>} True if target is in an expanded state. False otherwise.
	 */
	private async targetIsOpen( target: Locator ): Promise< boolean > {
		const checked = await target.getAttribute( 'aria-checked' );
		const pressed = await target.getAttribute( 'aria-pressed' );
		const expanded = await target.getAttribute( 'aria-expanded' );
		return checked === 'true' || pressed === 'true' || expanded === 'true';
	}

	/* Block Inserter */

	/**
	 * Opens the block inserter.
	 */
	async openBlockInserter(): Promise< void > {
		const editorParent = await this.editor.parent();

		const translatedButtonNameNew = await this.translateFromPage(
			'Block Inserter',
			'Generic label for block inserter button'
		);
		const blockInserterButton = editorParent.getByRole( 'button', {
			name: translatedButtonNameNew,
			exact: true,
		} );

		if ( ! ( await this.targetIsOpen( blockInserterButton ) ) ) {
			const editorParent = await this.editor.parent();
			const locator = editorParent.locator( selectors.blockInserterButton );
			await locator.click();
		}
	}

	/**
	 * Closes the block inserter.
	 */
	async closeBlockInserter(): Promise< void > {
		const editorParent = await this.editor.parent();

		const translatedButtonNameNew = await this.translateFromPage(
			'Block Inserter',
			'Generic label for block inserter button'
		);
		const blockInserterButton = editorParent.getByRole( 'button', {
			name: translatedButtonNameNew,
			exact: true,
		} );
		// count() returns immediately without waiting for the element to appear,
		// so this guard avoids getAttribute() timing out when the button is absent.
		if (
			( await blockInserterButton.count() ) > 0 &&
			( await this.targetIsOpen( blockInserterButton ) )
		) {
			await blockInserterButton.click();
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
		const desktopPreviewPaneLocator = editorParent.locator( selectors.previewPane );
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
		const editorParent = await this.editor.parent();

		const translatedButtonName = await this.translateFromPage( 'View' );
		const previewButton = editorParent.getByRole( 'button', {
			name: translatedButtonName,
			exact: true,
		} );

		if ( ! ( await this.targetIsOpen( previewButton ) ) ) {
			const editorParent = await this.editor.parent();
			const desktopPreviewButtonLocator = editorParent.locator( selectors.previewButton );
			await desktopPreviewButtonLocator.click();
		}
	}

	/**
	 * Closes the Preview menu for the Desktop viewport.
	 */
	async closeDesktopPreviewMenu(): Promise< void > {
		const editorParent = await this.editor.parent();

		const translatedButtonName = await this.translateFromPage( 'View' );
		const previewButton = editorParent.getByRole( 'button', {
			name: translatedButtonName,
			exact: true,
		} );

		if ( await this.targetIsOpen( previewButton ) ) {
			const editorParent = await this.editor.parent();
			const desktopPreviewButtonLocator = editorParent.locator( selectors.previewButton );
			await desktopPreviewButtonLocator.click();
		}
	}

	/* Publish and unpublish */

	/**
	 * Waits for the save/publish button.
	 *
	 * @returns {Promise<string>} String found on the button.
	 */
	async waitForPublishButton(): Promise< void > {
		const editorParent = await this.editor.parent();
		const publishButtonLocator = editorParent.locator( selectors.publishButton( 'enabled' ) );

		await publishButtonLocator.waitFor();
	}

	/**
	 * Clicks on the primary button to publish the article.
	 *
	 * This is applicable for the following scenarios:
	 * 	- publish of a new article (Publish)
	 * 	- update/save an existing article (Update)
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
				// Works with Gutenberg >=v18.2.0
				await editorParent.locator( selectors.postStatusButton ).click();
				await editorParent.getByRole( 'radio', { name: 'Draft' } ).click();
			} )(),
			( async () => {
				// Works with Gutenberg >=v15.8.0
				await this.openSettings( 'Settings' );
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
	 *
	 * For `target: 'Settings'` this toggles the standard post/page settings
	 * sidebar from its pinned header button.
	 *
	 * For `target: 'Jetpack'` this toggles the Jetpack ("Share to social
	 * media"/Publicize) sidebar from the more-options menu. That menu is shared
	 * with sibling plugin sidebars, notably "Jetpack Newsletter", so the entry
	 * is matched by its stable `aria-controls` id rather than the visible label.
	 * Selecting it usually activates the Jetpack complementary area, but the
	 * editor intermittently ends up with a sibling area active instead, from the
	 * exact same click. We therefore verify the active complementary area via
	 * the editor data store (the source of truth, unaffected by the sidebar's
	 * exit transition) and re-toggle if a sibling won.
	 */
	async openSettings( target: EditorToolbarSettingsButton ): Promise< void > {
		const editorParent = await this.editor.parent();

		if ( target === 'Settings' ) {
			// To support i18n tests.
			const translatedTargetName = await this.translateFromPage( target );
			const button = editorParent
				.locator( '.editor-header__settings, .edit-post-header__settings' )
				.getByLabel( translatedTargetName );

			if ( await this.targetIsOpen( button ) ) {
				await this.closeMoreOptionsMenu();
				return;
			}

			await button.click();
			return;
		}

		const menuItem = editorParent.locator(
			'[role="menuitemcheckbox"][aria-controls="jetpack-sidebar:jetpack"]'
		);

		const maxAttempts = 3;
		for ( let attempt = 1; attempt <= maxAttempts; attempt++ ) {
			await this.openMoreOptionsMenu();

			if ( await this.targetIsOpen( menuItem ) ) {
				// The Jetpack entry is already selected; close the menu and let
				// the verification below confirm the right area is active.
				await this.closeMoreOptionsMenu();
			} else {
				await menuItem.click();
			}

			if ( await this.waitForJetpackSidebarActive() ) {
				return;
			}
		}

		throw new Error(
			'openSettings( "Jetpack" ): a sibling sidebar (such as "Jetpack Newsletter") kept ' +
				`winning activation; the Jetpack sidebar was not the active complementary area after ${ maxAttempts } attempts.`
		);
	}

	/**
	 * Waits until the Jetpack sidebar (`jetpack-sidebar/jetpack`) is the active
	 * complementary area and has stayed active, uninterrupted, for a short
	 * settle window.
	 *
	 * An earlier version sampled the state on a fixed 300ms cadence and accepted
	 * two consecutive positive reads. That is a heuristic: it can miss a sibling
	 * stealing activation in the gap between two samples, and can give up one
	 * read short of success near the deadline. Instead, this subscribes to the
	 * editor data store and reacts as state transitions are dispatched, then
	 * requires Jetpack to stay the active area, uninterrupted, for `settleMs`
	 * before reporting success. A settle in progress is the only path to `true`;
	 * the deadline gives up with `false` and lets the caller retry. This is not a
	 * formal proof of stability (a steal-and-restore coalesced into a single
	 * `wp.data.batch` notification could still go unseen), but it observes far
	 * more than fixed-cadence sampling, and the flake this targets leaves the
	 * sibling persistently active, which the settle requirement reliably catches.
	 * When the store is unavailable the same settle logic runs over a DOM poll.
	 *
	 * The check runs inside the Editor frame, so it works for both the iframed
	 * (Simple) and non-iframed (Atomic) editors.
	 *
	 * @param {number} timeout  Maximum time to wait, in milliseconds.
	 * @param {number} settleMs How long Jetpack must stay active, uninterrupted,
	 *                          to count as settled.
	 * @returns {Promise<boolean>} True if the Jetpack sidebar settled as active.
	 */
	private async waitForJetpackSidebarActive(
		timeout = 5 * 1000,
		settleMs = 750
	): Promise< boolean > {
		const editorParent = await this.editor.parent();

		return editorParent.evaluate(
			( element, { timeoutMs, settleWindowMs }: { timeoutMs: number; settleWindowMs: number } ) =>
				new Promise< boolean >( ( resolve ) => {
					const jetpackId = 'jetpack-sidebar:jetpack';
					const jetpackArea = 'jetpack-sidebar/jetpack';
					const newsletterId = 'jetpack-subscriptions:jetpack-newsletter-settings-sidebar';

					const editorWindow = element.ownerDocument?.defaultView as
						| ( Window & {
								wp?: {
									data?: {
										select?: ( store: string ) => {
											getActiveComplementaryArea?: ( scope: string ) => string | null | undefined;
										};
										subscribe?: ( listener: () => void ) => () => void;
									};
								};
						  } )
						| null;

					const ownerDocument = element.ownerDocument;

					// The editor data store is the source of truth. A defined
					// reading (another area's id, or `null` for "closed") is
					// authoritative. The active-area scope is `core` on current
					// Gutenberg and `core/edit-post` on older builds; read `core`
					// first and consult the legacy scope only when `core` has no
					// answer, both to support old builds and to skip the
					// deprecation warning the legacy scope emits. Only when no
					// scope can answer do we consult the DOM, treating Jetpack as
					// active when its region is present and the sibling Newsletter
					// region is not.
					const isJetpackActive = (): boolean => {
						const store = editorWindow?.wp?.data?.select?.( 'core/interface' );
						if ( store?.getActiveComplementaryArea ) {
							let area = store.getActiveComplementaryArea( 'core' );
							if ( area === undefined ) {
								area = store.getActiveComplementaryArea( 'core/edit-post' );
							}
							if ( area === jetpackArea ) {
								return true;
							}
							if ( area !== undefined ) {
								return false;
							}
						}

						return (
							!! ownerDocument?.querySelector( `[id="${ jetpackId }"]` ) &&
							! ownerDocument?.querySelector( `[id="${ newsletterId }"]` )
						);
					};

					const timers: {
						settle?: ReturnType< typeof setTimeout >;
						poll?: ReturnType< typeof setInterval >;
						backstop?: ReturnType< typeof setTimeout >;
					} = {};
					let unsubscribe = () => {};
					let finished = false;

					const finish = ( settled: boolean ) => {
						if ( finished ) {
							return;
						}
						finished = true;
						if ( timers.settle ) {
							clearTimeout( timers.settle );
						}
						if ( timers.poll ) {
							clearInterval( timers.poll );
						}
						if ( timers.backstop ) {
							clearTimeout( timers.backstop );
						}
						unsubscribe();
						resolve( settled );
					};

					// Start the settle timer the first time Jetpack is seen
					// active; cancel it the moment anything else takes over, so
					// only an uninterrupted run of `settleWindowMs` resolves true.
					const onChange = () => {
						if ( isJetpackActive() ) {
							if ( ! timers.settle ) {
								timers.settle = setTimeout( () => finish( true ), settleWindowMs );
							}
						} else if ( timers.settle ) {
							clearTimeout( timers.settle );
							timers.settle = undefined;
						}
					};

					// Deadline: if Jetpack has not settled by now it is not going
					// to, so give up with `false` and let the caller retry. Because
					// the settle timer is the only path to `true`, a late, unsettled
					// flicker of Jetpack cannot slip a false positive through here.
					timers.backstop = setTimeout( () => finish( false ), timeoutMs );

					const subscribe = editorWindow?.wp?.data?.subscribe;
					if ( subscribe ) {
						unsubscribe = subscribe( onChange );
					} else {
						// No store to observe; poll the DOM so the same settle
						// logic still applies.
						timers.poll = setInterval( onChange, 200 );
					}

					// Evaluate the current state immediately so an already-active
					// sidebar starts its settle timer without waiting for a store
					// change that may never come.
					onChange();
				} ),
			{ timeoutMs: timeout, settleWindowMs: settleMs }
		);
	}

	/**
	 * Closes the editor settings.
	 */
	async closeSettings(): Promise< void > {
		const editorParent = await this.editor.parent();

		// Post/Page settings and Jetpack settings close buttons have slightly
		// different names. When building the accessible selector, a RegExp
		// must be used in order to support multiple accessible names.
		const translatedCloseSettingsName = await this.translateFromPage( 'Close Settings' );
		const translatedCloseJetpackSettingsName = await this.translateFromPage( 'Close plugin' );

		const buttonNames =
			envVariables.VIEWPORT_NAME === 'mobile'
				? 'Settings'
				: `${ translatedCloseJetpackSettingsName }|${ translatedCloseSettingsName }`;

		const button = editorParent.getByRole( 'button', {
			name: new RegExp( buttonNames ),
		} );

		if ( ! ( await this.targetIsOpen( button ) ) ) {
			return;
		}

		await button.click();
	}

	/**
	 * Closes the editor.
	 *
	 * Clicks the `W` logo in the corner to close the editor.
	 */
	async closeEditor(): Promise< void > {
		const editorParent = await this.editor.parent();

		const target = editorParent.getByRole( 'link', {
			name: 'View Posts',
		} );
		if ( await this.targetIsOpen( target ) ) {
			return;
		}

		await target.click();
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

		const editorParent = await this.editor.parent();

		const target = editorParent.getByRole( 'button', {
			name: 'Document Overview',
		} );

		if ( await this.targetIsOpen( target ) ) {
			return;
		}

		await target.click();
	}

	/**
	 * Closes the list view.
	 */
	async closeListView(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// List view is not available on mobile!
			return;
		}

		const editorParent = await this.editor.parent();

		const target = editorParent.getByRole( 'button', {
			name: 'Document Overview',
		} );

		if ( ! ( await this.targetIsOpen( target ) ) ) {
			return;
		}

		await target.click();
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
		const button = await this.getMoreOptionsButton();

		if ( await this.targetIsOpen( button ) ) {
			return;
		}

		await button.click();
	}

	/**
	 * Closes the more options menu.
	 */
	async closeMoreOptionsMenu(): Promise< void > {
		const button = await this.getMoreOptionsButton();

		if ( await this.targetIsOpen( button ) ) {
			await button.click();
		}
	}

	/**
	 * Returns the more options button instance.
	 */
	async getMoreOptionsButton() {
		const editorParent = await this.editor.parent();

		// To support i18n tests.
		const translatedTargetName = await this.translateFromPage( 'Options' );
		// Narrowing down to the "Editor top bar" is needed because it might conflict with
		// the options button for the block toolbar, causing a strict-mode violation error
		// due to duplicate elements on the page.
		return editorParent.getByLabel( 'Editor top bar' ).getByRole( 'button', {
			name: translatedTargetName,
			exact: true,
		} );
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
