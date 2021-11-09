import { Frame, Page } from 'playwright';
import { BrowserHelper } from '../..';

const selectors = {
	button: ( text: string ) => `button:text("${ text }")`,
	blogNameInput: 'input#siteTitle',
	taglineInput: 'input#tagline',
	backLink: 'a:text("Back")',
	designPickerContainer: '.design-picker',
	individualThemeContainer: ( name: string ) => `.design-button-container:has-text("${ name }")`,
	previewThemeButtonDesktop: ( name: string ) => `button:has-text("Preview ${ name }")`,
	previewThemeButtonMobile: ( name: string ) =>
		`button.design-picker__design-option:has-text("${ name }")`,
	themePreviewIframe: 'iframe[title=Preview]',
};

/**
 * Class encapsulating the flow when starting a new start ('/start')
 */
export class StartSiteFlow {
	private page: Page;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given a text, clicks on the first instance of the button with the text.
	 *
	 * @param {string} text User-visible text on the button.
	 * @returns {Promise<void>} No return value.
	 */
	async clickButton( text: string ): Promise< void > {
		await this.page.click( selectors.button( text ) );
	}

	/**
	 * Enter blog name
	 *
	 * @param name name for the blog
	 */
	async enterBlogName( name: string ): Promise< void > {
		await this.page.fill( selectors.blogNameInput, name );
	}

	/**
	 * Enter blog tagline
	 *
	 * @param tagline tagline for the blog
	 */
	async enterTagline( tagline: string ): Promise< void > {
		await this.page.fill( selectors.taglineInput, tagline );
	}

	/**
	 * Validates we've landed on the design picker screen
	 */
	async validateOnDesignPickerScreen(): Promise< void > {
		await this.page.waitForSelector( selectors.designPickerContainer );
	}

	/**
	 * Navigate back one screen in the flow
	 */
	async goBackOneScreen(): Promise< void > {
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( selectors.backLink ) ] );
	}

	/**
	 * Clicks button to preview a specific theme from theme selection screen
	 *
	 * @param themeName Name of theme, e.g. "Zoologist"
	 */
	async previewTheme( themeName: string ): Promise< void > {
		if ( BrowserHelper.getTargetDeviceName() === 'desktop' ) {
			await this.page.hover( selectors.individualThemeContainer( themeName ) );
			await this.page.click( selectors.previewThemeButtonDesktop( themeName ) );
		} else {
			await this.page.click( selectors.previewThemeButtonMobile( themeName ) );
		}
	}

	/**
	 * Get a Frame handle for the iframe holding the theme preview
	 *
	 * @returns The Frame handle for the theme preview iframe
	 */
	async getThemePreviewIframe(): Promise< Frame > {
		const elementHandle = await this.page.waitForSelector( selectors.themePreviewIframe );
		return ( await elementHandle.contentFrame() ) as Frame;
	}
}
