import { Page } from 'playwright';

const selectors = {
	searchInput: `input[aria-label="What would you like your domain name to be?"]`,
	placeholder: `.is-placeholder`,
	resultItem: `.domain-suggestion__content`,
};

/**
 * Component for the domain search feature in Upgrades > Domains.
 */
export class DomainSearchComponent {
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
	 * Searches for a domain using the keyword.
	 *
	 * @param {string} keyword Keyword to use in domain search.
	 */
	async search( keyword: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForSelector( selectors.placeholder, { state: 'detached' } ),
			this.page.fill( selectors.searchInput, keyword ),
		] );
	}

	/**
	 * Select a domain matching the keyword.
	 *
	 * The keyword can be anything that uniquely identifies the desired domain name
	 * in the search results listing. Typically, this would be the TLD.
	 *
	 * @param {string} keyword Unique keyword to select domains.
	 * @returns {string} Domain that was selected.
	 */
	async selectDomain( keyword: string ): Promise< string > {
		const selector = `${ selectors.resultItem }:has-text("${ keyword }")`;
		const targetItem = await this.page.waitForSelector( selector );
		// Heading element inside a given result contains the full domain name string.
		const selectedDomain = await targetItem
			.waitForSelector( 'h3' )
			.then( ( el ) => el.innerText() );

		await Promise.all( [ this.page.waitForNavigation(), targetItem.click() ] );

		return selectedDomain;
	}

	/**
	 * Clicks on a button matching the text.
	 *
	 * @param {string} text Exact text to match on.
	 */
	async clickButton( text: string ): Promise< void > {
		await this.page.click( `button:text-is("${ text }")` );
	}
}
