import { Page } from 'playwright';
import { getTargetDeviceName } from '../../browser-helper';
import type { Plans } from '../../types';

export type Features =
	| 'Custom domains'
	| 'Store'
	| 'SEO tools'
	| 'Plugins'
	| 'Ad-free'
	| 'Image storage'
	| 'Video storage'
	| 'Priority support';

const selectors = {
	// Generic
	button: ( text: string ) => `button:text("${ text }")`,
	wpLogo: 'div.gutenboarding__header-wp-logo',

	// Start your website
	siteTitle: '.acquire-intent-text-input__input',
	siteTitleLabel: 'label.site-title__input-label',
	siteIsCalled: 'label[data-e2e-string="My site is called"]',

	// Domain
	domainSearch: 'input[placeholder="Search for a domain"]',
	domainSuggestionSpan: ( target: string ) =>
		`.domain-picker__suggestion-item-name span:has-text("${ target }")`,

	// Design
	designButton: ( name: string ) => `button[data-e2e-button="freeOption"]:has-text("${ name }")`,
	fontPairingButton: ( platform: 'mobile' | 'desktop', fontName: string ) => {
		return `.style-preview__font-options-${ platform } span:text("${ fontName }")`;
	},
	mobileFontPairingDropdown: `button.style-preview__font-option-select`,

	// Features
	featureItem: `button.features__item`,

	// Plans
	planItem: '.plans-accordion-item',
	planName: '.plans-accordion-item__name',
	selectPlanButton: ( name: string ) =>
		`.plans-accordion-item:has(.plans-accordion-item__name:has-text("${ name }")) ${ selectors.button(
			'Select'
		) }`,

	// Create account
	email: 'input[type="email"]',
	password: 'input[type="password"]',

	// Post-signup design selection (for Free plans only)
	skipForNowButton: 'button:text("Skip for now")',

	// Language
	languagePicker: 'a:has(.gutenboarding__header-site-language-label)',
	languageButton: ( target: string ) => `button:has(span[lang="${ target }"])`,
};

/**
 * Implements actions of the Gutenboarding process.
 */
export class GutenboardingFlow {
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
	 * Given a text, clicks on the first instance of the button with the text.
	 *
	 * @param {string} text User-visible text on the button.
	 * @returns {Promise<void>} No return value.
	 */
	async clickButton( text: string ) {
		await this.page.click( selectors.button( text ) );
	}

	/**
	 * Clicks on the WP Logo on top left.
	 */
	async clickWpLogo(): Promise< void > {
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( selectors.wpLogo ) ] );
	}

	/* Initial (landing) screen */

	/**
	 * Enters the site title.
	 *
	 * This is equivalent to the Acquire Intent page from the Selenium suite.
	 *
	 * @param {string} title Title of the site.
	 */
	async enterSiteTitle( title: string ) {
		await this.page.fill( selectors.siteTitle, title );
	}

	/**
	 * Returns the text for site title label.
	 */
	async getSiteTitleLabel(): Promise< string > {
		const elementHandle = await this.page.waitForSelector( selectors.siteTitleLabel );
		return await elementHandle.innerText();
	}

	/* Domains screen */

	/**
	 * Enters the keyword into the domain search input.
	 *
	 * @param {string} keyword Keyword used for domain search.
	 */
	async searchDomain( keyword: string ) {
		await Promise.all( [
			this.page.waitForSelector( '.is-placeholder', { state: 'hidden' } ),
			this.page.fill( selectors.domainSearch, keyword ),
		] );
	}

	/**
	 * Given a domain name and TLD, select a matching domain.
	 *
	 * @param {string} target Target domain name to select.
	 * @returns {Promise<string>} Selected domain.
	 */
	async selectDomain( target: string ): Promise< string > {
		const selector = selectors.domainSuggestionSpan( target );
		const elementHandle = await this.page.waitForSelector( selector );

		// The blog URL is the full inner text of the matching element.
		const url = await elementHandle.innerText();
		await elementHandle.click();
		// Return the selected domain to the caller for further processing.
		return url;
	}

	/* Design screen */

	/**
	 * Given a name, select a design matching the name.
	 *
	 * @param {string} name Name of the design to use.
	 */
	async selectDesign( name: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.designButton( name ) ),
		] );
	}

	/**
	 * Given one name of the font in a pair, select a matching font peairing.
	 *
	 * Example:
	 * 	- name = Playfair will match [ Playfair / Fira Sans ]
	 * 	- name = Roboto will match [ Space Mono / Roboto ]
	 *
	 * @param {string} name One portion of the name of the font pair.
	 */
	async selectFont( name: string ): Promise< void > {
		// Font selector depends on the viewport name but lumps non-mobile into desktop.
		const viewportName = getTargetDeviceName() === 'mobile' ? 'mobile' : 'desktop';

		// Mobile viewport puts the buttons behind a dropdown.
		if ( viewportName === 'mobile' ) {
			await this.page.click( selectors.mobileFontPairingDropdown );
		}

		// Click on the desired font pairing.
		await this.page.click( selectors.fontPairingButton( viewportName, name ) );

		if ( viewportName === 'desktop' ) {
			await this.page.waitForSelector( `button.is-selected span:text("${ name }")` );
		} else {
			await this.page.waitForSelector(
				`button.is-selected-dropdown-option span:text("${ name }")`,
				{ state: 'hidden' }
			);
		}
	}

	/* Feature selection screen */

	/**
	 * Given an array of feature strings, selects matching features.
	 *
	 * @param {Features} features Array of features to select.
	 */
	async selectFeatures( features: Features[] ): Promise< void > {
		for await ( const feature of features ) {
			// Click on the feature to select, then make sure it is in fact selected by checking
			// whether the attribute `is-selected` is present for the button with that feature.
			await this.page.click( `${ selectors.featureItem } :text-is("${ feature }")` );
			await this.page.waitForSelector(
				`${ selectors.featureItem }.is-selected :text-is("${ feature }")`
			);
		}
	}

	/* Plan selection screen */

	/**
	 * Given a name, select a plan matching the name.
	 *
	 * @param {string} name Name of the plan.
	 */
	async selectPlan( name: Plans ): Promise< void > {
		// First, expand the accordion.
		await this.page.click( ':text-is("Show all plans")' );
		await this.page.click( selectors.selectPlanButton( name ) );
	}

	/**
	 * Checks if the recommended plan matches the expected name.
	 *
	 * @param {Plans} name Name of the plan.
	 */
	async validateRecommendedPlan( name: Plans ): Promise< void > {
		// The plan item with the `has-badge` attribute is the one that is recommended based on features.
		const elementHandle = await this.page.waitForSelector( `${ selectors.planItem }.has-badge` );
		await elementHandle.waitForSelector( `div:text-is("${ name }")` );
	}

	/**
	 * Creates an account (if Gutenboarding was initiated while logged out).
	 *
	 * @param {string} email Email address.
	 * @param {string} password Password of user.
	 */
	async signup( email: string, password: string ): Promise< void > {
		await this.page.fill( selectors.email, email );
		await this.page.fill( selectors.password, password );
		await this.page.click( selectors.button( 'Create account' ) );
	}

	/**
	 * Skips the Design selection screen if WordPress.com Free plan is selected.
	 */
	async skipDesign(): Promise< void > {
		await this.page.waitForLoadState( 'load' );
		await this.page.click( selectors.skipForNowButton );
	}

	/* Other actions */

	/**
	 * Clicks on the language picker on top right of the Gutenboarding flow.
	 */
	async clickLanguagePicker(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.languagePicker ),
		] );
	}

	/**
	 * Given a target string in ISO 639-1 format, click on the button representing
	 * the target language.
	 *
	 * @param {string} target Two-letter langauge code.
	 */
	async switchLanguage( target: string ): Promise< void > {
		await this.clickLanguagePicker();
		await Promise.all( [
			// Wait for the request response to complete.
			// This request runs last when selecting a new language and is responsible for obtaining
			// the translated strings.
			this.page.waitForResponse(
				( response ) =>
					response.status() === 200 && response.url().includes( `details?locale=${ target }` )
			),
			this.page.click( selectors.languageButton( target ) ),
		] );
	}
}
