import { Frame, Page } from 'playwright';
import envVariables from '../../env-variables';

const selectors = {
	// Generic
	button: ( text: string ) => `button:text("${ text }")`,
	backLink: 'button:text("Back")',

	// Inputs
	siteTitleInput: 'input#siteTitle:not(:disabled)',
	taglineInput: 'input#tagline:not(:disabled)',

	// Themes
	themePickerContainer: '.design-picker',
	individualThemeContainer: ( name: string ) => `.design-button-container:has-text("${ name }")`,
	previewThemeButtonDesktop: ( name: string ) => `button:has-text("Preview ${ name }")`,
	previewThemeButtonMobile: ( name: string ) =>
		`button.design-picker__design-option:has-text("${ name }")`,
	themePreviewIframe: 'iframe[title=Preview]',
	startWithThemeButton: ( name: string ) => `button:has-text("Start with ${ name }")`,

	// Store
	storeFeaturesContainer: 'div.signup__step.is-store-features',
	wooCommerceSignupContainer: '.signup.is-woocommerce-install',

	// Blog
	coursesContianer: 'div.signup__step.is-courses',
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
	 * Enter optional site title.
	 *
	 * @param {string} name Name for the blog or store.
	 */
	async enterSiteName( name: string ): Promise< void > {
		await this.page.fill( selectors.siteTitleInput, name );
	}

	/**
	 * Enter optional tagline.
	 *
	 * @param {string} tagline Tagline for the blog or store flow.
	 */
	async enterTagline( tagline: string ): Promise< void > {
		await this.page.fill( selectors.taglineInput, tagline );
	}

	/**
	 * Validates we've landed on the courses screen.
	 */
	async validateOnCoursesScreen(): Promise< void > {
		await this.page.waitForSelector( selectors.coursesContianer );
	}

	/**
	 * Validates we've landed on the store features screen.
	 */
	async validateOnStoreFeaturesScreen(): Promise< void > {
		await this.page.waitForSelector( selectors.storeFeaturesContainer );
	}

	/**
	 * Validates we've landed on the WooCommerce signup screen.
	 */
	async validateOnWooCommerceScreen(): Promise< void > {
		await this.page.waitForSelector( selectors.wooCommerceSignupContainer );
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

	/**
	 * Clicks button to select a specific theme from theme selection screen.
	 *
	 * @param {string} themeName Name of theme, e.g. "Zoologist".
	 */
	async selectTheme( themeName: string ): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
			await this.page.hover( selectors.individualThemeContainer( themeName ) );
			await this.page.click( selectors.startWithThemeButton( themeName ) );
		} else {
			await this.page.click( selectors.previewThemeButtonMobile( themeName ) );
			await this.page.click( selectors.startWithThemeButton( themeName ) );
		}
	}
}
