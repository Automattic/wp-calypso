import { Page } from 'playwright';
import envVariables from '../../env-variables';
import { EditorComponent } from './editor-component';
import type {
	ArticlePublishSchedule,
	EditorSidebarTab,
	ArticleSections,
	ArticlePrivacyOptions,
} from './types';

const panel = '[aria-label="Editor settings"]';

const selectors = {
	// Close button for mobile
	mobileCloseSidebarButton: `${ panel } [aria-label="Close settings"]:visible`,

	// Tab
	tabButton: ( tabName: EditorSidebarTab ) => `${ panel } button[data-label="${ tabName }"]`,
	activeTabButton: ( tabName: EditorSidebarTab ) =>
		`${ panel } button.is-active:has-text("${ tabName }")`,

	// General section-related
	section: ( name: ArticleSections ) =>
		`${ panel } .components-panel__body-title button:has-text("${ name }")`,
	showRevisionButton: '.edit-post-last-revision__panel', // Revision is a link, not a panel.

	// Status & Visibility
	visibilityButton: '.edit-post-post-visibility__toggle',
	visibilityPopover: 'fieldset.editor-post-visibility__dialog-fieldset',
	visibilityOption: ( option: ArticlePrivacyOptions ) => `input[value="${ option.toLowerCase() }"]`,
	postPasswordInput: '.editor-post-visibility__password-input',

	// Schedule
	scheduleButton: `button.edit-post-post-schedule__toggle`,
	scheduleInput: ( name: string ) => `.edit-post-post-schedule__dialog label:has-text("${ name }")`,
	scheduleMeridianButton: ( meridian: 'am' | 'pm' ) => `role=button[name="${ meridian }"i]`,

	// Category
	categoryCheckbox: ( categoryName: string ) =>
		`${ panel } div[aria-label=Categories] label:text("${ categoryName }")`,

	// Tag
	tagInput: `${ panel } .components-form-token-field:has-text("Add New Tag") input`,
	addedTag: ( tag: string ) =>
		`${ panel } .components-form-token-field__token-text:has-text("${ tag }")`,
};

/**
 * Represents an instance of the WordPress.com Editor's Settings sidebar.
 */
export class EditorSettingsSidebarComponent {
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
	 * Closes the sidebar only for Mobile viewport.
	 */
	async closeSidebarForMobile(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			return;
		}
		const editorFrame = await this.editor.getEditorFrame();
		const locator = editorFrame.locator( selectors.mobileCloseSidebarButton );
		await locator.click();
	}

	/**
	 * Clicks on one of the top tabs (e.g. 'Post' or 'Block') in the sidebar. Ensures that tab becomes active.
	 *
	 * @param {EditorSidebarTab} tabName Name of tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( tabName: EditorSidebarTab ): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		const locator = editorFrame.locator( selectors.tabButton( tabName ) );
		await locator.click();

		const activeTabLocator = editorFrame.locator( `${ selectors.tabButton( tabName ) }.is-active` );
		await activeTabLocator.waitFor();
	}

	/**
	 * Expands a collapsed section of the sidebar.
	 *
	 * If the section is already open, this method will pass.
	 *
	 * @param {ArticleSections} name Name of section to be expanded.
	 * @returns {Promise<void>} No return value.
	 */
	async expandSection( name: ArticleSections ): Promise< void > {
		if ( await this.targetIsOpen( selectors.section( name ) ) ) {
			return;
		}

		// Avoid the wpcalypso/staging banner.
		await this.scrollToBottomOfSidebar();

		const editorFrame = await this.editor.getEditorFrame();
		const sectionLocator = editorFrame.locator( selectors.section( name ) );
		await sectionLocator.click();

		const expandedLocator = editorFrame.locator(
			`${ selectors.section( name ) }[aria-expanded="true"]`
		);
		await expandedLocator.waitFor();
	}

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
		const editorFrame = await this.editor.getEditorFrame();
		const locator = editorFrame.locator( selector );
		const state = await locator.getAttribute( 'aria-expanded' );

		return state === 'true';
	}

	/* Post Privacy/Visibility */

	/**
	 * Opens the Post Visibility popover.
	 *
	 * If the popover is already toggled open, this method will pass.
	 *
	 * @throws {Error} If popover failed to open.
	 */
	async openVisibilityOptions(): Promise< void > {
		if ( await this.targetIsOpen( selectors.visibilityButton ) ) {
			return;
		}

		const editorFrame = await this.editor.getEditorFrame();
		const buttonLocator = editorFrame.locator( selectors.visibilityButton );
		await buttonLocator.click();

		const expandedLocator = editorFrame.locator(
			`${ selectors.visibilityButton }[aria-expanded="true"]`
		);
		await expandedLocator.waitFor();
	}

	/**
	 * Closes the Post Visibility popover.
	 *
	 * If the popover is already closed, this method will pass.
	 *
	 * @throws {Error} If popover failed to be closed.
	 */
	async closeVisibilityOptions(): Promise< void > {
		if ( ! ( await this.targetIsOpen( selectors.visibilityButton ) ) ) {
			return;
		}

		const editorFrame = await this.editor.getEditorFrame();
		const buttonLocator = editorFrame.locator( selectors.visibilityButton );
		await buttonLocator.click();

		const closedLocator = editorFrame.locator(
			`${ selectors.visibilityButton }[aria-expanded="false"]`
		);
		await closedLocator.waitFor();
	}

	/**
	 * Sets the post visibility to the provided visibility setting.
	 *
	 * @param {ArticlePrivacyOptions} visibility Desired post visibility setting.
	 * @param param1 Object parameter.
	 * @param {string} param1.password Password for the post. Normally an optinal value, this
	 * 	must be set if the `visibility` parameter is set to `Password`.
	 */
	async selectVisibility(
		visibility: ArticlePrivacyOptions,
		{ password }: { password?: string } = {}
	): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		const optionLocator = editorFrame.locator( selectors.visibilityOption( visibility ) );
		await optionLocator.click();

		if ( visibility === 'Private' ) {
			// Private articles are posted immediately and thus we must break the
			// single responsibility principle for this case.
			// @TODO: eventually refactor this out to a ConfirmationDialogComponent.
			const dialogConfirmLocator = editorFrame.locator(
				`div[role="dialog"] button:has-text("OK")`
			);
			await dialogConfirmLocator.click();
		}

		// For Password-protected posts, the password field needs to be filled.
		if ( visibility === 'Password' ) {
			if ( ! password ) {
				throw new Error( 'Post password is undefined.' );
			}
			await this.setPostPassword( password );
		}
	}

	/**
	 * Sets the article password, for password-protected articles.
	 *
	 * @param {string} password Password to be used.
	 */
	private async setPostPassword( password: string ): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		const inputLocator = editorFrame.locator( selectors.postPasswordInput );
		await inputLocator.fill( password );
	}

	/* Schedule */

	/**
	 * Opens the Schedule picker.
	 */
	async openSchedule(): Promise< void > {
		if ( await this.targetIsOpen( selectors.scheduleButton ) ) {
			return;
		}

		const editorFrame = await this.editor.getEditorFrame();
		const buttonLocator = editorFrame.locator( selectors.scheduleButton );
		await buttonLocator.click();
	}

	/**
	 * Closes the Schedule picker.
	 */
	async closeSchedule(): Promise< void > {
		// Under certain circumstances, the scheduler is auto-dismissed at the end
		// of interaction and thus the closure is not required.
		// For instance, if the current time is in the 'am' and the article is
		// scheduled for 'pm', the act of clicking on the 'pm' button dismisses the
		// scheduler.
		if ( ! ( await this.targetIsOpen( selectors.scheduleButton ) ) ) {
			return;
		}

		const editorFrame = await this.editor.getEditorFrame();
		const buttonLocator = editorFrame.locator( selectors.scheduleButton );
		await buttonLocator.click();
	}

	/**
	 * Schedules the page/post.
	 *
	 * @param {ArticlePublishSchedule} date Date of the article to be scheduled.
	 */
	async setScheduleDetails( date: ArticlePublishSchedule ): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		let key: keyof ArticlePublishSchedule;

		for ( key in date ) {
			if ( key === 'meridian' ) {
				// am/pm is a button.
				const meridianButtonLocator = editorFrame.locator(
					selectors.scheduleMeridianButton( date[ key ] )
				);
				await meridianButtonLocator.click();
				continue;
			}
			if ( key === 'month' ) {
				// For month numbers less than 10, pad the digit to be
				// 2 digits as required by the select.
				const monthSelectLocator = editorFrame.locator( selectors.scheduleInput( 'month' ) );
				await monthSelectLocator.selectOption( ( date[ key ] + 1 ).toString().padStart( 2, '0' ) );
				continue;
			}
			if ( key === 'date' ) {
				const daySelector = editorFrame.locator( selectors.scheduleInput( 'day' ) );
				await daySelector.fill( date[ key ].toString() );
				continue;
			}

			// Regular input fields.
			const inputLocator = editorFrame.locator( selectors.scheduleInput( key ) );
			await inputLocator.fill( date[ key ].toString() );
		}
	}

	/* Revisions */

	/**
	 * Clicks on the Revisions section in the sidebar to show a revisions modal.
	 */
	async showRevisions(): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		const locator = editorFrame.locator( selectors.showRevisionButton );
		await locator.click();
	}

	/**
	 * Check a category checkbox for an article.
	 *
	 * @param {string} name Category name.
	 * @throws {Error} If requested cateogry is not found.
	 */
	async checkCategory( name: string ): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		//TODO: Categories can be slow because we never do any cleanup. Remove extended timeout once we start doing cleanup.
		const locator = editorFrame.locator( selectors.categoryCheckbox( name ) );

		try {
			await locator.click( { timeout: 60 * 1000 } );
		} catch {
			throw new Error( `No category matching ${ name } found.` );
		}
	}

	/**
	 * Enters a tag in the tag field, presses enter to submit it
	 * and validates it shows up in field.
	 *
	 * This method does not partial match; if a tag does not exist with the
	 * provided name, a new one is added.
	 *
	 * @param {string} name Tag name to enter.
	 */
	async enterTag( name: string ): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		const inputLocator = editorFrame.locator( selectors.tagInput );
		await inputLocator.fill( name );
		await this.page.keyboard.press( 'Enter' );

		const addedTagLocator = editorFrame.locator( selectors.addedTag( name ) );
		await addedTagLocator.waitFor();
	}

	/**
	 * Enter the URL slug for the page/post.
	 *
	 * @param {string} slug URL slug to set.
	 */
	async enterUrlSlug( slug: string ) {
		const editorFrame = await this.editor.getEditorFrame();
		await editorFrame.getByRole( 'button', { name: /Change URL:/ } ).click();
		await editorFrame.getByLabel( 'Permalink' ).fill( slug );
		await editorFrame.getByRole( 'button', { name: 'Close', exact: true } ).click();
	}

	/**
	 * Scroll to the bottom of the sidebar.
	 *
	 * Useful to work around the wpcalypso/staging banner (for proxied users).
	 */
	private async scrollToBottomOfSidebar(): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		const locator = editorFrame.locator( selectors.section( 'Discussion' ) );
		await locator.scrollIntoViewIfNeeded();
	}
}
