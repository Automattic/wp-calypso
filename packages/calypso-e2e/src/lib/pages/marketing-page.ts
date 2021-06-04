/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';
import { toTitleCase } from '../../data-helper';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	content: '#primary',
	navtabsList: '.section-nav-tabs__list',

	// Traffic tab
	websiteMetaTextArea: '#advanced_seo_front_page_description',
	seoPreviewButton: '.seo-settings__preview-button',
	seoPreviewPane: '.web-preview.is-seo',
	seoPreviewPaneCloseButton: '.web-preview .web-preview__close',
};

/**
 * Page representing the Tools > Marketing page.
 *
 * @augments {BaseContainer}
 */
export class MarketingPage extends BaseContainer {
	constructor( page: Page ) {
		super( page, selectors.content );
	}

	/**
	 * Post-initialization steps when creating an instance of this object.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		await this.page.waitForSelector( selectors.navtabsList );
	}

	/**
	 * Given a string, clicks on the tab matching the string at top of the page.
	 *
	 * @param {string} name Name of the tab to click on the top of the page.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTabItem( name: string ): Promise< void > {
		const sanitizedName = toTitleCase( [ name ] );

		await this.page.click( `text=${ sanitizedName }` );
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
		await this.page.click( selectors.seoPreviewButton );
		await this.page.waitForSelector( selectors.seoPreviewPane );
	}

	/**
	 * Close the preview of SEO changes.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closeSEOPreview(): Promise< void > {
		await this.page.click( selectors.seoPreviewPaneCloseButton );
		await this.page.waitForSelector( selectors.content );
	}
}
