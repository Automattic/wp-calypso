import { Page } from 'playwright';
import { reloadAndRetry } from '../../element-helper';

const selectors = {
	searchInput: '.search-component__input',
	firstResultItem: '.domain-suggestion:first-child .domain-suggestion__content',
	domainSuggestionRow: '.domain-suggestion',
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
		/**
		 *
		 * Closure to pass into the retry method.
		 *
		 * @param {Page} page Page object.
		 */
		async function searchDomainClosure( page: Page ): Promise< void > {
			const [ response ] = await Promise.all( [
				page.waitForResponse( /suggestions\?/ ),
				page.getByRole( 'searchbox' ).fill( keyword ),
			] );

			if ( ! response ) {
				const errorText = await page.getByRole( 'status', { name: 'Notice' } ).innerText();
				throw new Error(
					`Encountered error while searching for domain.\nOriginal error: ${ errorText }`
				);
			}
		}

		// Domain lookup service is external to Automattic and sometimes it returns an error.
		// Retry a few times when this is encountered.
		await reloadAndRetry( this.page, searchDomainClosure );
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
		const targetRow = this.page.locator( selectors.domainSuggestionRow ).filter( {
			has: this.page.getByLabel( keyword ),
		} );
		await targetRow.waitFor();

		const target = targetRow.getByRole( 'button' );
		await target.waitFor();

		const selectedDomain = await targetRow.getByLabel( keyword ).getAttribute( 'aria-label' );

		if ( ! selectedDomain ) {
			throw new Error( `No domain found for keyword: ${ keyword }` );
		}

		await target.click();

		return selectedDomain;
	}

	/**
	 * Select the first domain suggestion.
	 *
	 * @returns {string} Domain that was selected.
	 */
	async selectFirstSuggestion(): Promise< string > {
		const targetItem = await this.page.waitForSelector( selectors.firstResultItem );
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
		await this.page.getByRole( 'button', { name: text, exact: true } ).click();
	}
}
