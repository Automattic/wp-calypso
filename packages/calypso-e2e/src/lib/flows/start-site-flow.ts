import { Page } from 'playwright';

/**
 * Step name in site setup flow.
 *
 * @see client/landing/stepper/declarative-flow/site-setup-flow.ts for all step names
 */
export type StepName = 'goals' | 'vertical' | 'intent' | 'designSetup' | 'options';
type WriteActions = 'Start writing' | 'Start learning' | 'View designs';

const selectors = {
	// Generic
	button: ( text: string ) => `button:text("${ text }")`,
	backLink: 'button:text("Back")',

	// Inputs
	blogNameInput: 'input[name="siteTitle"]:not(:disabled)',
	taglineInput: 'input[name="tagline"]:not(:disabled)',

	// Themes
	individualThemeContainer: ( name: string ) => `.design-button-container:has-text("${ name }")`,

	// Goals
	goalButton: ( goal: string ) =>
		`.select-card-checkbox__container:has-text("${ goal.toLowerCase() }")`,
	selectedGoalButton: ( goal: string ) =>
		`.select-card-checkbox__container:has(:checked):has-text("${ goal }")`,

	// Step containers
	contentAgnosticContainer: '.step-container',
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
		await this.page.getByRole( 'button', { name: text } ).click();
	}

	/**
	 * Returns the step name of the current page
	 */
	async getCurrentStep(): Promise< StepName > {
		// Make sure the container is loaded first, then we can see which it is.
		await this.page.waitForSelector( selectors.contentAgnosticContainer );
		if ( ( await this.page.locator( selectors.goalsStepContainer ).count() ) > 0 ) {
			return 'goals';
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
	 * Enter blog name.
	 *
	 * @param {string} name Name for the blog.
	 */
	async enterBlogName( name: string ): Promise< void > {
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
		const locator = this.page.locator( selectors.taglineInput );
		await locator.fill( tagline );

		// Verify the data is saved as expected.
		const readBack = await locator.inputValue();
		if ( readBack !== tagline ) {
			throw new Error( `Failed to set blog tagline: expected ${ tagline }, got ${ readBack }` );
		}
	}

	/* Write Goal */

	/**
	 * Performs action available in the Write intent.
	 *
	 * @param {WriteActions} action Actions for the Write intent.
	 */
	async clickWriteAction( action: WriteActions ) {
		await this.page.getByRole( 'button', { name: action } ).click();

		if ( action === 'Start writing' ) {
			// Extended timeout because the site is being
			// headstarted at this time.
			await this.page.waitForURL( /setup\/site-setup\/processing/, { timeout: 20 * 1000 } );
		}
		if ( action === 'Start learning' ) {
			await this.page.waitForURL( /setup\/site-setup\/courses/ );
		}
		if ( action === 'View designs' ) {
			await this.page.waitForURL( /setup\/site-setup\/designSetup/ );
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
	async selectTheme( themeName: string ): Promise< void > {
		await this.page.getByRole( 'link', { name: themeName } ).first().click();
	}
}
