import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const selectors = {
	exitButton: `a[aria-label="Go back to the Dashboard"]`,
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
	 * Exits the site editor.
	 *
	 * Clicks the Dashboard menu link to exit the editor.
	 */
	async exit(): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		const exitButtonLocator = editorFrame
			.getByRole( 'region', { name: 'Navigation sidebar' } )
			.locator( selectors.exitButton );
		await exitButtonLocator.click();
	}

	/**
	 * Clicks sidebar link to open the template parts list.
	 */
	async navigateToTemplatePartsManager(): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		await editorFrame.locator( selectors.templatePartsItem ).click();
		await editorFrame.locator( selectors.manageAllTemplatePartsItem ).click();
	}

	/**
	 * Ensures that the nav sidebar is at the top level ("Design")
	 */
	async ensureNavigationTopLevel(): Promise< void > {
		const editorFrame = await this.editor.getEditorFrame();
		const waitForNavigationTopLevel = async () => {
			await editorFrame
				.getByRole( 'region', { name: 'Navigation sidebar' } )
				.locator( selectors.exitButton )
				.waitFor();
		};

		const headerLocator = editorFrame.locator( selectors.navigationScreenTitle );
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
		const editorFrame = await this.editor.getEditorFrame();
		await editorFrame.getByRole( 'button', { name: text, exact: true } ).click();
	}
}
