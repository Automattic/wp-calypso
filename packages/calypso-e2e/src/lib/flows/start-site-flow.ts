import { Frame, Page } from 'playwright';
import envVariables from '../../env-variables';

/**
 * Step name in site setup flow.
 *
 * @see client/landing/stepper/declarative-flow/site-setup-flow.ts for all step names
 */
export type StepName = 'goals' | 'vertical' | 'intent' | 'designSetup' | 'options';

const selectors = {
	// Generic
	button: ( text: string ) => `button:text("${ text }")`,
	backLink: 'button:text("Back")',

	// Inputs
	blogNameInput: 'input[name="siteTitle"]:not(:disabled)',
	taglineInput: 'input[name="tagline"]:not(:disabled)',
	verticalInput: '.select-vertical__suggestion-input input',

	// Themes
	individualThemeContainer: ( name: string ) => `.design-button-container:has-text("${ name }")`,
	previewThemeButtonDesktop: ( name: string ) => `button:has-text("Preview ${ name }")`,
	previewThemeButtonMobile: ( name: string ) =>
		`button.design-picker__design-option:has-text("${ name }")`,
	themePreviewIframe: 'iframe[title=Preview]',

	// Goals
	goalButton: ( goal: string ) => `.select-card__container:has-text("${ goal }")`,
	selectedGoalButton: ( goal: string ) => `.select-card__container.selected:has-text("${ goal }")`,

	// Step containers
	themePickerContainer: '.design-picker',
	goalsStepContainer: '.goals-step',
	verticalsStepContainer: '.site-vertical',
	intentStepContainer: '.intent-step',
	optionsStepContainer: '.is-step-write',
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
	 * Returns the step name of the current page
	 */
	async getCurrentStep(): Promise< StepName > {
		await this.page.waitForLoadState( 'networkidle' );
		if ( ( await this.page.locator( selectors.goalsStepContainer ).count() ) > 0 ) {
			return 'goals';
		}
		if ( ( await this.page.locator( selectors.verticalsStepContainer ).count() ) > 0 ) {
			return 'vertical';
		}
		if ( ( await this.page.locator( selectors.intentStepContainer ).count() ) > 0 ) {
			return 'intent';
		}
		if ( ( await this.page.locator( selectors.themePickerContainer ).count() ) > 0 ) {
			return 'designSetup';
		}
		if ( ( await this.page.locator( selectors.optionsStepContainer ).count() ) > 0 ) {
			return 'options';
		}
		throw new Error( `Unknown or invalid step` );
	}

	/**
	 * Select a goal by text.
	 *
	 * @param {string} goal The goal to select
	 */
	async selectGoal( goal: string ): Promise< void > {
		await this.page.click( selectors.goalButton( goal ) );
		await this.page.waitForSelector( selectors.selectedGoalButton( goal ) );
	}

	/**
	 * Enter site vertical.
	 *
	 * @param {string} vertical Name of the vertical to select
	 */
	async enterVertical( vertical: string ): Promise< void > {
		await this.page.waitForLoadState( 'networkidle' );

		const input = this.page.locator( selectors.verticalInput );
		await input.fill( vertical );

		const readBack = await input.inputValue();
		if ( readBack !== vertical ) {
			throw new Error( `Failed to set vertical: expected ${ vertical }, got ${ readBack }` );
		}
	}

	/**
	 * Enter blog name.
	 *
	 * @param {string} name Name for the blog.
	 */
	async enterBlogName( name: string ): Promise< void > {
		await this.page.waitForLoadState( 'networkidle' );
		const defaultInputlocator = this.page.locator( selectors.blogNameInput );

		await defaultInputlocator.fill( name );

		// Verify the data is saved as expected.
		const filledInputLocator = this.page.locator( selectors.blogNameInput );
		const readBack = await filledInputLocator.inputValue();
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
		await locator.fill( tagline );

		// Verify the data is saved as expected.
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
