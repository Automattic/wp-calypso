import { Page } from 'playwright';
import envVariables from '../../env-variables';
import { EditorComponent } from './editor-component';
import type { ArticlePublishSchedule, EditorSidebarTab, ArticlePrivacyOptions } from './types';

const panel = '[aria-label="Editor settings"]';

const selectors = {
	section: ( name: string ) =>
		`${ panel } .components-panel__body-title button:has-text("${ name }")`,
	showRevisionButton: '.edit-post-last-revision__panel', // Revision is a link, not a panel.

	// Status & Visibility
	visibilityButton: '.edit-post-post-visibility__toggle',
	visibilityPopover: 'fieldset.editor-post-visibility__dialog-fieldset',
	visibilityOption: ( option: ArticlePrivacyOptions ) => `input[value="${ option.toLowerCase() }"]`,
	postPasswordInput: '.editor-post-visibility__password-input',

	// Schedule
	scheduleButton: `button.editor-post-schedule__dialog-toggle`,
	scheduleInput: ( name: string ) => `.editor-post-schedule__dialog label:has-text("${ name }")`,
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

	//#region Generic methods

	/**
	 * Clicks a button matching the accessible name.
	 *
	 * @param {string} name Accessible name of the button.
	 */
	async clickButton( name: string ): Promise< void > {
		const editorParent = await this.editor.parent();

		await editorParent.getByRole( 'button', { name: name } ).click();
	}

	/**
	 * Enters the specified text to an input field, specified by a label.
	 *
	 * In the future, this method may support other methods of locating a
	 * text box.
	 *
	 * @param {string} text Text to enter.
	 * @param param1 Keyed object parametr.
	 * @param {string} param1.label Locate text field by label.
	 */
	async enterText( text: string, { label }: { label: string } ): Promise< void > {
		const editorParent = await this.editor.parent();

		if ( label ) {
			return await editorParent.getByLabel( label ).fill( text );
		}

		throw new Error( `Must specify a method to locate the text field.` );
	}

	//#endregion

	/**
	 * Closes the sidebar for mobile viewport.
	 *
	 * This method can close both the post/page settings as well as the Jetpack
	 * sidebar.
	 */
	async closeSidebarForMobile(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			return;
		}
		const editorParent = await this.editor.parent();
		await editorParent.getByRole( 'button', { name: /Close Settings|Close plugin/ } ).click();
	}

	/**
	 * Clicks on one of the top tabs (e.g. 'Post' or 'Block') in the sidebar. Ensures that tab becomes active.
	 *
	 * @param {EditorSidebarTab} tabName Name of tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( tabName: EditorSidebarTab ): Promise< void > {
		const editorParent = await this.editor.parent();

		await editorParent.getByRole( 'tab', { name: tabName, exact: true } ).click();
	}

	/**
	 * Expands a collapsed section of the sidebar.
	 *
	 * If the section is already open, this method will pass.
	 *
	 * @param {string} name Name of section to be expanded.
	 */
	async expandSection( name: string ): Promise< void > {
		if ( await this.targetIsOpen( selectors.section( name ) ) ) {
			return;
		}

		const editorParent = await this.editor.parent();
		const sectionLocator = editorParent.locator( selectors.section( name ) );
		await sectionLocator.click( { position: { x: 5, y: 5 } } );

		const expandedLocator = editorParent.locator(
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
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selector );
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

		const editorParent = await this.editor.parent();
		const buttonLocator = editorParent.locator( selectors.visibilityButton );
		await buttonLocator.click();

		const expandedLocator = editorParent.locator(
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

		const editorParent = await this.editor.parent();
		const buttonLocator = editorParent.locator( selectors.visibilityButton );
		await buttonLocator.click();

		const closedLocator = editorParent.locator(
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
		const editorParent = await this.editor.parent();
		const optionLocator = editorParent.locator( selectors.visibilityOption( visibility ) );
		await optionLocator.click();

		if ( visibility === 'Private' ) {
			// Private articles are posted immediately and thus we must break the
			// single responsibility principle for this case.
			// @TODO: eventually refactor this out to a ConfirmationDialogComponent.
			const dialogConfirmLocator = editorParent.locator(
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
		const editorParent = await this.editor.parent();
		const inputLocator = editorParent.locator( selectors.postPasswordInput );
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

		const editorParent = await this.editor.parent();
		const buttonLocator = editorParent.locator( selectors.scheduleButton );
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

		const editorParent = await this.editor.parent();
		const buttonLocator = editorParent.locator( selectors.scheduleButton );
		await buttonLocator.click();
	}

	/**
	 * Schedules the page/post.
	 *
	 * @param {ArticlePublishSchedule} date Date of the article to be scheduled.
	 */
	async setScheduleDetails( date: ArticlePublishSchedule ): Promise< void > {
		const editorParent = await this.editor.parent();
		let key: keyof ArticlePublishSchedule;

		for ( key in date ) {
			if ( key === 'meridian' ) {
				// am/pm is a button.
				const meridianButtonLocator = editorParent.locator(
					selectors.scheduleMeridianButton( date[ key ] )
				);
				await meridianButtonLocator.click();
				continue;
			}
			if ( key === 'month' ) {
				// For month numbers less than 10, pad the digit to be
				// 2 digits as required by the select.
				const monthSelectLocator = editorParent.locator( selectors.scheduleInput( 'month' ) );
				await monthSelectLocator.selectOption( ( date[ key ] + 1 ).toString().padStart( 2, '0' ) );
				continue;
			}
			if ( key === 'date' ) {
				const daySelector = editorParent.locator( selectors.scheduleInput( 'day' ) );
				await daySelector.fill( date[ key ].toString() );
				continue;
			}

			// Regular input fields.
			const inputLocator = editorParent.locator( selectors.scheduleInput( key ) );
			await inputLocator.fill( date[ key ].toString() );
		}
	}

	/* Revisions */

	/**
	 * Clicks on the Revisions section in the sidebar to show a revisions modal.
	 */
	async showRevisions(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.showRevisionButton );
		await locator.click();
	}

	/**
	 * Check a category checkbox for an article.
	 *
	 * @param {string} name Category name.
	 * @throws {Error} If requested cateogry is not found.
	 */
	async checkCategory( name: string ): Promise< void > {
		const editorParent = await this.editor.parent();
		//TODO: Categories can be slow because we never do any cleanup. Remove extended timeout once we start doing cleanup.
		const locator = editorParent.locator( selectors.categoryCheckbox( name ) );

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
		const editorParent = await this.editor.parent();
		const inputLocator = editorParent.locator( selectors.tagInput );
		await inputLocator.fill( name );
		await this.page.keyboard.press( 'Enter' );

		const addedTagLocator = editorParent.locator( selectors.addedTag( name ) );
		await addedTagLocator.waitFor();
	}

	/**
	 * Enter the URL slug for the page/post.
	 *
	 * @param {string} slug URL slug to set.
	 */
	async enterUrlSlug( slug: string ) {
		const editorParent = await this.editor.parent();
		await editorParent.getByRole( 'button', { name: /Change URL:/ } ).click();
		await editorParent.getByLabel( 'Permalink' ).fill( slug );
		await editorParent.getByRole( 'button', { name: 'Close', exact: true } ).click();
	}
}
