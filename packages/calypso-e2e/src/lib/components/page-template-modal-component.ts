import { Frame, Page } from 'playwright';
import { envVariables } from '../..';

type TemplateCategory = 'About';

const selectors = {
	templateCategoryButton: ( category: TemplateCategory ) =>
		`.page-pattern-modal__category-list button:has-text("${ category }")`,
	mobileTemplateCategorySelectBox: '.page-pattern-modal__mobile-category-dropdown',
	template: ( label: string ) => `button.pattern-selector-item__label:has-text("${ label }")`,
};

/**
 * Represents the page template selection modal when first loading a new page in the editor.
 */
export class PageTemplateModalComponent {
	private page: Page;
	private editorIframe: Frame;

	/**
	 * Creates an instance of the page.
	 *
	 * @param {Frame} editorIframe Iframe from the gutenberg editor.
	 * @param {Page} page Object representing the base page.
	 */
	constructor( editorIframe: Frame, page: Page ) {
		this.page = page;
		this.editorIframe = editorIframe;
	}

	/**
	 * Select a template category from the sidebar of options.
	 *
	 * @param {TemplateCategory} category Name of the category to select.
	 */
	async selectTemplateCatagory( category: TemplateCategory ): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.editorIframe.selectOption(
				selectors.mobileTemplateCategorySelectBox,
				category.toLowerCase()
			);
		} else {
			const locator = this.editorIframe.locator( selectors.templateCategoryButton( category ) );
			await locator.click();
		}
	}

	/**
	 * Select a template from the grid of options.
	 *
	 * @param {string} label Label for the template (the string underneath the preview).
	 */
	async selectTemplate( label: string ): Promise< void > {
		const locator = this.editorIframe.locator( selectors.template( label ) );
		await locator.click();
	}
}
