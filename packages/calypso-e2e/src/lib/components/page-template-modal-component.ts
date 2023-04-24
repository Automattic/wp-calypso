import { Page } from 'playwright';
import { EditorWindow, envVariables } from '../..';

type TemplateCategory = 'About';

/**
 * Represents the page template selection modal when first loading a new page in the editor.
 */
export class PageTemplateModalComponent {
	private page: Page;
	private editorWindow: EditorWindow;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorWindow} editorWindow The EditorWindow instance.
	 */
	constructor( page: Page, editorWindow: EditorWindow ) {
		this.page = page;
		this.editorWindow = editorWindow;
	}

	/**
	 * Select a template category from the sidebar of options.
	 *
	 * @param {TemplateCategory} category Name of the category to select.
	 */
	async selectTemplateCategory( category: TemplateCategory ): Promise< void > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await editorFrame
				.locator( '.page-pattern-modal__mobile-category-dropdown' )
				.selectOption( category.toLowerCase() );
		} else {
			await editorFrame.getByRole( 'menuitem', { name: category, exact: true } ).click();
		}
	}

	/**
	 * Select a template from the grid of options.
	 *
	 * @param {string} label Label for the template (the string underneath the preview).
	 */
	async selectTemplate( label: string ): Promise< void > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		await editorFrame.getByRole( 'option', { name: label, exact: true } ).click();
	}

	/**
	 * Select a blank page as your template.
	 */
	async selectBlankPage(): Promise< void > {
		const editorFrame = await this.editorWindow.getEditorFrame();
		await editorFrame.getByRole( 'button', { name: 'Blank page' } ).click();
	}
}
