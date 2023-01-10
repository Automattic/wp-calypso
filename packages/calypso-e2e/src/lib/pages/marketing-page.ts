import { Page } from 'playwright';
import { clickNavTab } from '../../element-helper';

const selectors = {
	// Traffic tab
	websiteMetaTextArea: '#advanced_seo_front_page_description',
	seoPreviewButton: '.seo-settings__preview-button',
	seoPreviewPane: '.web-preview.is-seo',
	seoPreviewPaneCloseButton: '.web-preview__close',
};

/**
 * Page representing the Tools > Marketing page.
 */
export class MarketingPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given a string, clicks on the tab matching the string at top of the page.
	 *
	 * @param {string} name Name of the tab to click on the top of the page.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( name: string ): Promise< void > {
		await clickNavTab( this.page, name );
	}

	/* SEO Preview Methods */

	/**
	 * Enters text into the Website Meta Information field.
	 *
	 * @param {string} [text] String to be used as the description of the web site in SEO.
	 * @returns {Promise<void>} No return value.
	 */
	async enterWebsiteMetaInformation( text = 'test text' ): Promise< void > {
		await this.page.fill( selectors.websiteMetaTextArea, text );
	}

	/**
	 * Open the preview of SEO changes.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openSEOPreview(): Promise< void > {
		const locator = this.page.locator( selectors.seoPreviewButton );
		await locator.click();
		await this.page.waitForSelector( selectors.seoPreviewPane );
	}

	/**
	 * Close the preview of SEO changes.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closeSEOPreview(): Promise< void > {
		await this.page.click( selectors.seoPreviewPaneCloseButton );
		await this.page.waitForSelector( selectors.seoPreviewButton );
	}
}
