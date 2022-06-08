import { Frame, Page } from 'playwright';
import envVariables from '../../env-variables';

const selectors = {
	// Generic
	button: ( text: string ) => `button:text("${ text }")`,
	backLink: 'button:text("Back")',

	// Inputs
	blogNameInput: 'input[name="siteTitle"]',
	taglineInput: 'input[name="tagline"]',

	// Themes
	themePickerContainer: '.design-picker',
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
	 * Given text, clicks on the first instance of the button with the text.
	 *
	 * @param {string} text User-visible text on the button.
	 */
	async clickButton( text: string ): Promise< void > {
		await this.page.click( selectors.button( text ) );
	}

	/**
	 * Enter blog name.
	 *
	 * @param {string} name Name for the blog.
	 */
	async enterBlogName( name: string ): Promise< void > {
		await this.page.waitForLoadState( 'networkidle' );
		const locator = this.page.locator( selectors.blogNameInput );
		await locator.fill( '' );
		await locator.fill( name );

		const readBack = await locator.inputValue();
		if ( readBack !== name ) {
			throw new Error( `Failed to set blog name: expected ${ name }, got ${ readBack }` );
		}
	}

	/**
	 * Enter blog tagline.
	 *
	 * @param {string} tagline Tagline for the blog.
	 */
	async enterTagline( tagline: string ): Promise< void > {
		await this.page.waitForLoadState( 'networkidle' );
		const locator = this.page.locator( selectors.taglineInput );
		await locator.fill( '' );
		await locator.fill( tagline );

		const readBack = await locator.inputValue();
		if ( readBack !== tagline ) {
			throw new Error( `Failed to set blog tagline: expected ${ tagline }, got ${ readBack }` );
		}
	}

	/**
	 * Validates we've landed on the design picker screen.
	 */
	async validateOnDesignPickerScreen(): Promise< void > {
		await this.page.waitForSelector( selectors.themePickerContainer );
	}

	/**
	 * Navigate back one screen in the flow.
	 */
	async goBackOneScreen(): Promise< void > {
		await this.page.click( selectors.backLink );
	}

	/**
	 * Clicks button to preview a specific theme from theme selection screen.
	 *
	 * @param {string} themeName Name of theme, e.g. "Zoologist".
	 */
	async previewTheme( themeName: string ): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
			await this.page.hover( selectors.individualThemeContainer( themeName ) );
			await this.page.click( selectors.previewThemeButtonDesktop( themeName ) );
		} else {
			await this.page.click( selectors.previewThemeButtonMobile( themeName ) );
		}
	}

	/**
	 * Get a Frame handle for the iframe holding the theme preview.
	 *
	 * @returns The Frame handle for the theme preview iframe.
	 */
	async getThemePreviewIframe(): Promise< Frame > {
		const elementHandle = await this.page.waitForSelector( selectors.themePreviewIframe );
		return ( await elementHandle.contentFrame() ) as Frame;
	}
}
