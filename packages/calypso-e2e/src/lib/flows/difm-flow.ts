import { Page } from 'playwright';
import { DataHelper } from '../..';

const selectors = {
	// General
	button: ( text: string ) => `button:text("${ text }")`,
	header: ( text: string ) => `h1.formatted-header__title:has-text("${ text }")`,

	// Options page
	siteNameInput: '#siteTitle',
	taglineInput: '#tagline',

	// Social page
	twitterInput: 'input[name=twitterUrl]',

	// Design page
	freeDesignButton: 'button[data-e2e-button=freeOption]',

	//Page picker page
	pageOption: ( text: string ) => `div.css-1wedqbn:has-text("${ text }")`,

	// Checkout page
	checkoutHeader: '.checkout-step__header:has-text("Your order")',

	// Existing sites
	searchBar: 'input[type=search]',
	siteItem: ( text: string ) => `.site__title:has-text("${ text }")`,

	// Confirmation box
	confirmationInput: 'input#confirmTextChangeInput',
};

/**
 * Class encapsulating the flow when starting a new do-it-for-me site order.
 */
export class DIFMFlow {
	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( private page: Page ) {}

	/**
	 * Given text, click on the button's first instance with the text.
	 *
	 * @param {string} text User-visible text on the button.
	 */
	async clickButton( text: string ): Promise< void > {
		const selector = selectors.button( text );
		await this.page.click( selector );
	}

	/**
	 * Validates that we've are seeing the correct header.
	 *
	 * @param {string} title The title that the page should be showing.
	 */
	async validatePageTitle( title: string ): Promise< void > {
		await this.page.waitForSelector( selectors.header( title ) );
	}

	/**
	 * Go to first setup page.
	 */
	async visitSetup(): Promise< void > {
		await this.page.goto(
			DataHelper.getCalypsoURL(
				'/start/do-it-for-me/new-or-existing-site?flags=signup/redesigned-difm-flow'
			)
		);
	}

	/**
	 * Validates that we've landed on the starting page.
	 */
	async validateStartPage(): Promise< void > {
		await this.validatePageTitle( 'Do It For Me' );
	}

	/**
	 * Validates that we've landed on the options page.
	 */
	async validateOptionsPage(): Promise< void > {
		await this.validatePageTitle( "First, let's give your site a name" );
	}

	/**
	 * Validates that we've landed on the social page.
	 */
	async validateSocialPage(): Promise< void > {
		await this.validatePageTitle( 'Do you have social media profiles?' );
	}

	/**
	 * Validates that we've landed on the design page.
	 */
	async validateDesignPage(): Promise< void > {
		await this.validatePageTitle( 'Themes' );
	}

	/**
	 * Validates that we've landed on the page picker page.
	 */
	async validatePagePickerPage(): Promise< void > {
		await this.validatePageTitle( 'Add pages to your' );
	}

	/**
	 * Validates that we've landed on the 'choose existing' page.
	 */
	async validateUseExistingPage(): Promise< void > {
		await this.validatePageTitle( 'Choose where you want us to build your site.' );
	}

	/**
	 * Validates that the confirmation modal is being shown.
	 */
	async validateConfirmationBox(): Promise< void > {
		await this.validatePageTitle( 'Site Reset Confirmation' );
	}

	/**
	 * Validates that we've landed on the checkout page.
	 */
	async validateCheckoutPage(): Promise< void > {
		await this.page.waitForSelector( selectors.checkoutHeader, { timeout: 60000 } );
	}

	/**
	 * Enter the values for your site name as well as an optional tagline.
	 *
	 * @param {string} name The name for the new site.
	 * @param {string} [tagline] An optional tagline.
	 */
	async enterOptions( name: string, tagline?: string ): Promise< void > {
		await this.page.fill( selectors.siteNameInput, name );
		if ( typeof tagline !== 'undefined' ) {
			await this.page.fill( selectors.taglineInput, tagline );
		}
	}

	/**
	 * Enter the links to social media profiles.
	 *
	 * @param {string} twitter The link to a twitter profile.
	 */
	async enterSocial( twitter: string ): Promise< void > {
		await this.page.fill( selectors.twitterInput, twitter );
	}

	/**
	 * Select one of the page designs offered.
	 *
	 * @param {string} name The name of the page design
	 */
	async selectPage( name: string ): Promise< void > {
		await this.page.click( selectors.pageOption( name ) );
	}

	/**
	 * Choose the first free design offered.
	 */
	async chooseFreeDesign(): Promise< void > {
		await this.page.click( selectors.freeDesignButton );
	}

	/**
	 * Search the existing pages available to be replaced.
	 *
	 * @param {string} text The search text
	 */
	async searchForSite( text: string ): Promise< void > {
		await this.page.fill( selectors.searchBar, text );
	}

	/**
	 * Select one of the pages available to be replaced.
	 *
	 * @param {string} title The title of the site to be selected.
	 */
	async selectSite( title: string ): Promise< void > {
		await this.page.click( selectors.siteItem( title ) );
	}

	/**
	 * Confirm the deletion by entering DELETE into the text box.
	 */
	async confirmDeletion(): Promise< void > {
		await this.page.fill( selectors.confirmationInput, 'DELETE' );
	}
}
