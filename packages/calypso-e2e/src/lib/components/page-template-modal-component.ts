import { Locator, Page } from 'playwright';
import { envVariables } from '../..';

type TemplateCategory = 'About';

/**
 * Represents the page template selection modal when first loading a new page in the editor.
 */
export class PageTemplateModalComponent {
	private page: Page;
	private editorWindow: Locator;

	/**
	 * Creates an instance of the page.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} editorWindow Locator to the editor window.
	 */
	constructor( page: Page, editorWindow: Locator ) {
		this.page = page;
		this.editorWindow = editorWindow;
	}

	/**
	 * Select a template category from the sidebar of options.
	 *
	 * @param {TemplateCategory} category Name of the category to select.
	 */
	async selectTemplateCategory( category: TemplateCategory ): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.editorWindow
				.locator( '.page-pattern-modal__mobile-category-dropdown' )
				.selectOption( category.toLowerCase() );
		} else {
			await this.editorWindow.getByRole( 'menuitem', { name: category, exact: true } ).click();
		}
	}

	/**
	 * Select a template from the grid of options.
	 *
	 * @param {string} label Label for the template (the string underneath the preview).
	 */
	async selectTemplate( label: string ): Promise< void > {
		await this.editorWindow.getByRole( 'option', { name: label, exact: true } ).click();
	}

	/**
	 * Select a blank page as your template.
	 */
	async selectBlankPage(): Promise< void > {
		await this.editorWindow.getByRole( 'button', { name: 'Blank page' } ).click();
	}
}
