/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

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

	async _postInit(): Promise< void > {
		await this.page.waitForSelector( selectors.navtabsList );
	}

	async clickTabItem( name: string ): Promise< void > {
		const sanitizedName = name.toProperCase();

		await this.page.click( `text=${ sanitizedName }` );
	}

	/* SEO Preview Methods */
	async enterWebsiteMetaInformation( text = 'test text' ): Promise< void > {
		await this.page.fill( selectors.websiteMetaTextArea, text );
		await this.page.click( selectors.seoPreviewButton );
	}

	async openSEOPreview(): Promise< void > {
		await this.page.waitForSelector( selectors.seoPreviewPane );
	}

	async closeSEOPreview(): Promise< void > {
		await this.page.click( selectors.seoPreviewPaneCloseButton );
	}
}
