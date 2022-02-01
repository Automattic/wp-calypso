import { Page } from 'playwright';

const selectors = {
	searchInput: `.search-component__input`,
	resultPlaceholder: `.is-placeholder`,
	resultItem: ( keyword: string ) => `.domain-suggestion__content:has-text("${ keyword }")`,
};

/**
 * Component for the domain search feature.
 *
 * This class applies to multiple locations within WordPress.com that displays a domain search component.
 * Examples:
 * 	- Upgrades > Domains
 * 	- Signup flow
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
			this.page.waitForSelector( selectors.resultPlaceholder, { state: 'detached' } ),
			this.page.fill( selectors.searchInput, keyword ),
		] );
	}

	/**
	 * Select a domain matching the keyword.
	 *
	 * The keyword can be anything that uniquely identifies the desired domain name
	 * in the search results listing.
	 *
	 * Examples:
	 * 	keyword = uniquewordpresscomsite.com
	 * 	keyword = .com
	 *
	 * If multiple matches are found, the first match is attmpted.
	 *
	 * @param {string} keyword Unique keyword to select domains.
	 * @returns {string} Domain that was selected.
	 */
	async selectDomain( keyword: string ): Promise< string > {
		const targetItem = await this.page.waitForSelector( selectors.resultItem( keyword ) );
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
