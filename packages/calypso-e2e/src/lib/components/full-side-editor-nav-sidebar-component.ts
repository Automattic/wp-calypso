import { Page, Locator } from 'playwright';

const panel = '.edit-site-navigation-panel';
const selectors = {
	exitLink: `${ panel } a.edit-site-navigation-panel__back-to-dashboard`,
	templatePartsLink: `${ panel } ul ul > li:nth-of-type(3) a`,
};

/**
 * Represents an instance of the WordPress.com FSE Editor's navigation sidebar.
 * This is distinct from the post editor because the markup is very different.
 * Unlike the post editor's, this is visible on all viewports for the site editor.
 */
export class FullSiteEditorNavSidebarComponent {
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {Locator} editor Locator or FrameLocator to the editor.
	 */
	constructor( private page: Page, private editor: Locator ) {}

	/**
	 * Exits the site editor.
	 *
	 * Clicks the Dashboard menu link to exit the editor.
	 */
	async exit(): Promise< void > {
		const exitLinkLocator = this.editor.locator( selectors.exitLink );
		await exitLinkLocator.click();
	}

	/**
	 * Clicks sidebar link to open the template parts list.
	 */
	async navigateToTemplateParts(): Promise< void > {
		const locator = this.editor.locator( selectors.templatePartsLink );
		await locator.click();
	}
}
