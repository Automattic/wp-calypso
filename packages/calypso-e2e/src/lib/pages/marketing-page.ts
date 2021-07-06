/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';
import { toTitleCase } from '../../data-helper';

const selectors = {
	content: '#primary',
	navTabs: 'div.section-nav-tabs',
	navTabsDropdownOption: '.select-dropdown__option',

	// Traffic tab
	websiteMetaTextArea: '#advanced_seo_front_page_description',
	seoPreviewButton: '.seo-settings__preview-button',
	seoPreviewPane: '.web-preview.is-seo',
	seoPreviewPaneCloseButton: '.web-preview__close',
};

/**
 * Page representing the Tools > Marketing page.
 *
 * @augments {BaseContainer}
 */
export class MarketingPage extends BaseContainer {
	/**
	 * Given a string, clicks on the tab matching the string at top of the page.
	 *
	 * @param {string} name Name of the tab to click on the top of the page.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTabItem( name: string ): Promise< void > {
		const navTabs = await this.page.waitForSelector( selectors.navTabs );
		const isDropdown = await navTabs
			.getAttribute( 'class' )
			.then( ( value ) => value?.includes( 'is-dropdown' ) );
		const sanitizedName = toTitleCase( [ name ] );

		if ( isDropdown ) {
			await navTabs.click();
			await this.page.click( `${ selectors.navTabsDropdownOption } >> text=${ name }` );
		} else {
			await this.page.click( `text=${ sanitizedName }` );
		}
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
