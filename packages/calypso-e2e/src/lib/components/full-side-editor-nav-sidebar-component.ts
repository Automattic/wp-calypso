import { Page, Locator } from 'playwright';

const selectors = {
	exitButton: `a[aria-label="Go back to the dashboard"]`,
	templatePartsItem: 'button[id="/wp_template_part"]',
	manageAllTemplatePartsItem: 'button:text("Manage all template parts")',
	navigationScreenTitle: '.edit-site-sidebar-navigation-screen__title',
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
		const exitButtonLocator = this.editor.locator( selectors.exitButton );
		await exitButtonLocator.click();
	}

	/**
	 * Clicks sidebar link to open the template parts list.
	 */
	async navigateToTemplatePartsManager(): Promise< void > {
		await this.editor.locator( selectors.templatePartsItem ).click();
		await this.editor.locator( selectors.manageAllTemplatePartsItem ).click();
	}

	/**
	 * Ensures that the nav sidebar is at the top level ("Design")
	 */
	async ensureNavigationTopLevel(): Promise< void > {
		const waitForNavigationTopLevel = async () => {
			await this.editor.locator( selectors.exitButton ).waitFor();
		};

		const headerLocator = this.editor.locator( selectors.navigationScreenTitle );
		await headerLocator.waitFor();
		const headerText = await headerLocator.innerText();
		if ( headerText === 'Design' ) {
			return;
		}

		if (
			headerText === 'Navigation' ||
			headerText === 'Templates' ||
			headerText === 'Template parts'
		) {
			await this.clickNavButtonByExactText( 'Back' );
			await waitForNavigationTopLevel();
			return;
		}

		await this.clickNavButtonByExactText( 'Back' );
		await this.clickNavButtonByExactText( 'Back' );
		await waitForNavigationTopLevel();
	}

	/**
	 * Clicks on a button with the exact name.
	 */
	async clickNavButtonByExactText( text: string ): Promise< void > {
		await this.editor.getByRole( 'button', { name: text, exact: true } ).click();
	}
}
