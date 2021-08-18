import { Page } from 'playwright';
import { getViewportName } from '../../browser-helper';

export type Plans = 'Free' | 'Personal' | 'Premium' | 'Business' | 'eCommerce';
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
	button: ( text: string ) => `button:text("${ text }")`,

	// Start your website
	siteTitle: '.acquire-intent-text-input__input',

	// Domain
	domainSearch: 'input[placeholder="Search for a domain"]',
	domainSuggestionSpan: ( name: string, tld: string ) =>
		`.domain-picker__suggestion-item-name span:has-text("${ name }${ tld }")`,

	// Design
	design: ( name: string ) => `button[data-e2e-button="freeOption"] span:text("${ name }")`,
	fontPairingButton: ( platform: 'mobile' | 'desktop', fontName: string ) => {
		return `.style-preview__font-options-${ platform } span:text("${ fontName }")`;
	},
	mobileFontPairingDropdown: `button.style-preview__font-option-select`,

	// Features
	featureItem: `button.features__item`,

	// Plans
	planItem: '.plans-accordion-item',
	planName: '.plans-accordion-item__name',
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
	 * @param param0 Keyed object parameter.
	 * @param {string} param0.name Name portion of the domain.
	 * @param {string} param0.tld TLD portion of the domain.
	 * @returns {Promise<string>} Selected domain.
	 */
	async selectDomain( { name, tld }: { name: string; tld: string } ): Promise< string > {
		const selector = selectors.domainSuggestionSpan( name, tld );
		const elementHandle = await this.page.waitForSelector( selector );

		// The blog URL is the full inner text of the matching element.
		const url = await elementHandle.innerText();
		await elementHandle.click();
		// Return the selected domain to the caller for further processing.
		return url;
	}

	/**
	 * Given a name, select a design matching the name.
	 *
	 * @param {string} name Name of the design to use.
	 */
	async selectDesign( name: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.design( name ) ),
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
		const viewportName = getViewportName() === 'mobile' ? 'mobile' : 'desktop';

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

	/**
	 * Given a name, select a plan matching the name.
	 *
	 * @param {string} name Name of the plan.
	 */
	async selectPlan( name: Plans ): Promise< void > {
		// First, expand the accordion.
		await this.page.click( ':text-is("Show all plans")' );

		const plans = await this.page.$$( selectors.planItem );

		// Iterate through the top-level container for each plan.
		// Then, extract name of the plan and if it finds a match with the desired plan,
		// click on the `Select` button within the container.
		for await ( const plan of plans ) {
			const planName = await plan
				.waitForSelector( selectors.planName )
				.then( ( el ) => el.innerText() );

			if ( planName === name ) {
				const button = await plan.waitForSelector( selectors.button( 'Select' ) );
				await button.click();
			}
		}
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
}
