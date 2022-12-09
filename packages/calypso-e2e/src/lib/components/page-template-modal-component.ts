import { Frame, Page } from 'playwright';
import { envVariables } from '../..';

type TemplateCategory = 'About';

/**
 * Represents the page template selection modal when first loading a new page in the editor.
 */
export class PageTemplateModalComponent {
	private page: Page;
	private editorFrame: Page | Frame;

	/**
	 * Creates an instance of the page.
	 *
	 * @param {Page | Frame} editorFrame Frame for the gutenberg editor.
	 * @param {Page} page Object representing the base page.
	 */
	constructor( editorFrame: Page | Frame, page: Page ) {
		this.page = page;
		this.editorFrame = editorFrame;
	}

	/**
	 * Select a template category from the sidebar of options.
	 *
	 * @param {TemplateCategory} category Name of the category to select.
	 */
	async selectTemplateCategory( category: TemplateCategory ): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.editorFrame.selectOption(
				'.page-pattern-modal__mobile-category-dropdown',
				category.toLowerCase()
			);
		} else {
			await this.editorFrame.getByRole( 'menuitem', { name: category } ).click();
		}
	}

	/**
	 * Select a template from the grid of options.
	 *
	 * @param {string} label Label for the template (the string underneath the preview).
	 */
	async selectTemplate( label: string ): Promise< void > {
		await this.editorFrame.getByRole( 'button', { name: label } ).click();
	}

	/**
	 * Select a blank page as your template.
	 */
	async selectBlankPage(): Promise< void > {
		await this.editorFrame.getByRole( 'button', { name: 'Blank page' } ).click();
	}
}
