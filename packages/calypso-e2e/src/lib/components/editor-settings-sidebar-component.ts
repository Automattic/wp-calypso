import { Frame, Page } from 'playwright';

export type EditorSidebarTab = 'Post' | 'Block';
export type EditorSidebarSection = 'Categories' | 'Tags';

const sidebarParentSelector = '[aria-label="Editor settings"]';

const selectors = {
	tabButton: ( tabName: EditorSidebarTab ) =>
		`${ sidebarParentSelector } button:has-text("${ tabName }")`,
	activeTabButton: ( tabName: EditorSidebarTab ) =>
		`${ sidebarParentSelector } button.is-active:has-text("${ tabName }")`,
	sectionToggle: ( sectionName: EditorSidebarSection ) =>
		`${ sidebarParentSelector } .components-panel__body-toggle:has-text("${ sectionName }")`,
	expandedSection: ( sectionName: EditorSidebarSection ) =>
		`${ sidebarParentSelector } .is-opened .components-panel__body-toggle:has-text("${ sectionName }")`,
	revisionsToggle: `${ sidebarParentSelector } .components-panel__body:has-text("Revisions")`,
	revisionsModal: 'div.editor-revisions',
	lastSection: `${ sidebarParentSelector } .components-panel__body >> nth=-1`,
	categoryCheckbox: ( categoryName: string ) =>
		`${ sidebarParentSelector } [aria-label=Categories] :text("${ categoryName }")`,
	tagInput: `${ sidebarParentSelector } .components-form-token-field:has-text("Add New Tag") input`,
	addedTag: ( tagName: string ) =>
		`${ sidebarParentSelector } .components-form-token-field:has-text("Add New Tag") .components-form-token-field__token:has-text("${ tagName }")`,
	closeSidebarButton: `${ sidebarParentSelector } [aria-label="Close settings"]:visible`, // there's a hidden copy in there
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
	async expandSectionIfCollapsed( sectionName: EditorSidebarSection ): Promise< void > {
		// Avoid the wpcalypso/staging banner
		await this.scrollToBottomOfSidebar();
		if ( ! ( await this.frame.isVisible( selectors.expandedSection( sectionName ) ) ) ) {
			await this.frame.click( selectors.sectionToggle( sectionName ) );
		}
	}

	/**
	 * Clikcks on the Revisions section in the sidebar to show a revisions modal.
	 */
	async showRevisions(): Promise< void > {
		await this.frame.click( selectors.revisionsToggle );
		await this.frame.waitForSelector( selectors.revisionsModal );
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
