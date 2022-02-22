import { Frame, Page } from 'playwright';

export type EditorSidebarTab = 'Post' | 'Block' | 'Page';
export type EditorSidebarSection = 'Categories' | 'Tags' | 'Status & Visibility' | 'Permalink';
export type PrivacyOptions = 'Public' | 'Private' | 'Password';

interface Schedule {
	year: number;
	month: number;
	date: number;
	hours: number;
	minutes: number;
	meridian: 'am' | 'pm';
}

const sidebarParentSelector = '[aria-label="Editor settings"]';

const selectors = {
	// Tab
	tabButton: ( tabName: EditorSidebarTab ) =>
		`${ sidebarParentSelector } button:has-text("${ tabName }")`,
	activeTabButton: ( tabName: EditorSidebarTab ) =>
		`${ sidebarParentSelector } button.is-active:has-text("${ tabName }")`,

	// Sections
	sectionToggle: ( sectionName: EditorSidebarSection ) =>
		`${ sidebarParentSelector } .components-panel__body-toggle:has-text("${ sectionName }")`,
	expandedSection: ( sectionName: EditorSidebarSection ) =>
		`${ sidebarParentSelector } .is-opened .components-panel__body-toggle:has-text("${ sectionName }")`,
	revisionsToggle: `${ sidebarParentSelector } .components-panel__body:has-text("Revisions")`,
	lastSection: `${ sidebarParentSelector } .components-panel__body >> nth=-1`,

	// Status & Visibility
	visibilityToggle: '.edit-post-post-visibility__toggle',
	visibilityPopover: 'fieldset.editor-post-visibility__dialog-fieldset',
	visibilityOption: ( option: PrivacyOptions ) => `input[value="${ option.toLowerCase() }"]`,
	postPasswordInput: '.editor-post-visibility__dialog-password-input',

	// Schedule
	scheduleButton: `button.edit-post-post-schedule__toggle`,
	scheduleInput: ( attribute: string ) => `input[name="${ attribute }"]`,
	scheduleMeridianButton: ( meridian: 'am' | 'pm' ) =>
		`button.components-datetime__time-${ meridian }-button`,
	scheduleResetButton: 'button.components-datetime__date-reset-button',

	// Category
	categoryCheckbox: ( categoryName: string ) =>
		`${ sidebarParentSelector } [aria-label=Categories] :text("${ categoryName }")`,
	tagInput: `${ sidebarParentSelector } .components-form-token-field:has-text("Add New Tag") input`,

	// Tag
	addedTag: ( tagName: string ) =>
		`${ sidebarParentSelector } .components-form-token-field:has-text("Add New Tag") .components-form-token-field__token:has-text("${ tagName }")`,
	closeSidebarButton: `${ sidebarParentSelector } [aria-label="Close settings"]:visible`, // there's a hidden copy in there

	// URL Slug
	urlSlugInput: '.components-base-control__field:has-text("URL Slug") input',
};

/**
 * Component representing the settings sidebar in the editor.
 */
export class EditorSettingsSidebarComponent {
	private frame: Frame;
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Frame} frame The editor iframe to use as the page for Playwright actions.
	 * @param page The underlying Playwright page
	 */
	constructor( frame: Frame, page: Page ) {
		this.frame = frame;
		this.page = page;
	}

	/**
	 * Clicks on one of the top tabs (e.g. 'Post' or 'Block') in the sidebar. Ensures that tab becomes active.
	 *
	 * @param {EditorSidebarTab} tabName Name of tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( tabName: EditorSidebarTab ): Promise< void > {
		await this.frame.click( selectors.tabButton( tabName ) );
		await this.frame.waitForSelector( selectors.activeTabButton( tabName ) );
	}

	/**
	 * If the provided sidebar section is collapsed, toggles it to be expanded.
	 *
	 * @param {EditorSidebarSection} sectionName Name of section.
	 * @returns {Promise<void>} No return value.
	 */
	async expandSection( sectionName: EditorSidebarSection ): Promise< void > {
		// Avoid the wpcalypso/staging banner
		await this.scrollToBottomOfSidebar();
		if ( ! ( await this.frame.isVisible( selectors.expandedSection( sectionName ) ) ) ) {
			await this.frame.click( selectors.sectionToggle( sectionName ) );
		}
	}

	/* Status & Visibility */

	/**
	 * Sets the post visibility to the provided visibility setting.
	 *
	 * @param {PrivacyOptions} visibility Desired post visibility setting.
	 * @param param1 Object parameter.
	 * @param {string} param1.password Password for the post. Normally an optinal value, this
	 * 	must be set if the `visibility` parameter is set to `Password`.
	 */
	async setVisibility(
		visibility: PrivacyOptions,
		{ password }: { password?: string } = {}
	): Promise< void > {
		await this.expandSection( 'Status & Visibility' );
		await this.frame.click( selectors.visibilityToggle );
		// Important to wait for the popover element to finish its animation, as the radio buttons
		// will not be actionable until then.
		const popoverHandle = await this.frame.waitForSelector( selectors.visibilityPopover );
		await popoverHandle.waitForElementState( 'stable' );
		await this.frame.click( selectors.visibilityOption( visibility ) );

		if ( visibility === 'Private' ) {
			// @TODO: eventually refactor this out to a ConfirmationDialogComponent.
			await this.frame.click( `div[role="dialog"] button:has-text("OK")` );
		}

		// For Password-protected posts, the password field needs to be filled.
		if ( visibility === 'Password' ) {
			if ( ! password ) {
				throw new Error( 'Post password is undefined.' );
			}
			await this.setPostPassword( password );
		}

		// Close the visibility sub-panel.
		await this.frame.click( selectors.visibilityToggle );
	}

	/**
	 * Sets the article password, for password-protected articles.
	 *
	 * @param {string} password Password to be used.
	 */
	async setPostPassword( password: string ): Promise< void > {
		await this.frame.fill( selectors.postPasswordInput, password );
	}

	/**
	 * Opens the scheduler if required.
	 */
	async openSchedule(): Promise< void > {
		const expanded = await this.frame.getAttribute( selectors.scheduleButton, 'aria-expanded' );
		if ( expanded !== 'true' ) {
			await this.frame.click( selectors.scheduleButton );
		}
		await this.frame.waitForSelector( `${ selectors.scheduleButton }[aria-expanded="true"]` );
	}

	/**
	 * Closes the scheduler if required.
	 *
	 * Under certain circumstances, the scheduler is auto-dismissed at the end
	 * of interaction and thus the closure is not required.
	 *
	 * For instance, if the current time is in the 'am' and the article is
	 * scheduled for 'pm', the act of clicking on the 'pm' button dismisses the
	 * scheduler.
	 */
	async closeSchedule(): Promise< void > {
		const expanded = await this.frame.getAttribute( selectors.scheduleButton, 'aria-expanded' );
		if ( expanded !== 'false' ) {
			await this.frame.click( selectors.scheduleButton );
		}
		await this.frame.waitForSelector( `${ selectors.scheduleButton }[aria-expanded="false"]` );
	}

	/**
	 * Schedules the page/post.
	 *
	 * @param {Schedule} date Date of the article to be scheduled.
	 */
	async schedule( date: Schedule ): Promise< void > {
		let key: keyof Schedule;

		for ( key in date ) {
			if ( key === 'meridian' ) {
				// am/pm is a button.
				await this.frame.click( selectors.scheduleMeridianButton( date[ key ] ) );
				continue;
			}
			if ( key === 'month' ) {
				// For month numbers less than 10, pad the digit to be
				// 2 digits as required by the select.
				await this.frame.selectOption(
					'select[name="month"]',
					date[ key ].toString().padStart( 2, '0' )
				);
				continue;
			}

			// Regular input fields.
			const targetSelector = selectors.scheduleInput( key );
			await this.frame.fill( targetSelector, date[ key ].toString() );
		}
	}

	/**
	 * Resets previously set schedule.
	 */
	async resetSchedule(): Promise< void > {
		await this.frame.click( selectors.scheduleResetButton );
	}

	/**
	 * Clicks on the Revisions section in the sidebar to show a revisions modal.
	 */
	async showRevisions(): Promise< void > {
		await this.frame.click( selectors.revisionsToggle );
	}

	/**
	 * Check a category checkbox for a post in the sidebar.
	 *
	 * @param {string} categoryName The category name.
	 * @returns {Promise<void>} No return value.
	 */
	async clickCategory( categoryName: string ): Promise< void > {
		//TODO: Categories can be slow because we never do any cleanup. Remove extended timeout once we start doing cleanup.
		await this.frame.click( selectors.categoryCheckbox( categoryName ), { timeout: 60 * 1000 } );
	}

	/**
	 * Enters a tag in the tag field, presses enter to submit it, and validates it shows up in field.
	 * Does no partial matching, if a tag doesn't exist with the provided name, a new one is added.
	 *
	 * @param {string} tagName Tag name to enter.
	 * @returns {Promise<void>} No return value.
	 */
	async enterTag( tagName: string ): Promise< void > {
		await this.frame.fill( selectors.tagInput, tagName );
		await this.page.keyboard.press( 'Enter' );
		await this.frame.waitForSelector( selectors.addedTag( tagName ) ); // make sure it got added!
	}

	/**
	 * Enter the URL slug for the page/post.
	 *
	 * @param {string} slug URL slug to set.
	 */
	async enterUrlSlug( slug: string ) {
		await this.frame.fill( selectors.urlSlugInput, slug );
		// Playwright is so fast, let's make sure the post's/page's state actually updates in case we're going to publish or update right after.
		// By adding the forward slash, we ensure the new route has been appended to the fully qualified URL in the sidebar.
		await this.frame.waitForSelector( `text=/${ slug }` );
	}

	/**
	 * Closes this settings sidebar using close button within sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closeSidebar(): Promise< void > {
		await this.frame.click( selectors.closeSidebarButton );
	}

	/**
	 *	Scroll to the bottom of the sidebar. Useful if trying to avoid the wpcalypso/staging banner.
	 */
	private async scrollToBottomOfSidebar(): Promise< void > {
		// There are a lot of different ways this could be done (e.g. send `PageDown` or mouse scroll events).
		// Opting for scrolling the last section into view as it targets an explicit element, and ensures waiting until scrolling is done before moving on.
		const lastSectionElement = await this.frame.waitForSelector( selectors.lastSection );
		await lastSectionElement.scrollIntoViewIfNeeded();
	}
}
