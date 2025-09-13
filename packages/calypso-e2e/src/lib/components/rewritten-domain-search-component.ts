import { Page } from 'playwright';
import { reloadAndRetry, waitForElementEnabled } from '../../element-helper';

/**
 * Component for the domain search feature.
 *
 * This class applies to multiple locations within WordPress.com that displays a domain search component.
 * Examples:
 * 	- Upgrades > Domains
 * 	- Signup flow
 */
export class RewrittenDomainSearchComponent {
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
			const searchAndPressEnter = async () => {
				await page.getByRole( 'searchbox' ).fill( keyword );
				await page.getByRole( 'searchbox' ).press( 'Enter' );
			};

			const [ response ] = await Promise.all( [
				page.waitForResponse( /suggestions\?/ ),
				searchAndPressEnter(),
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
	 * Clicks on the button to bring over an external domain to WordPress.com
	 */
	async clickBringItOver(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Bring it over' } ).click();
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
		const targetRow = this.page.getByTitle( keyword );
		await targetRow.waitFor();

		const target = targetRow.getByRole( 'button' );
		await target.waitFor();

		await target.click();

		const domainName = await targetRow.getAttribute( 'title' );

		if ( ! domainName ) {
			throw new Error( `No domain found for keyword: ${ keyword }` );
		}

		return domainName;
	}

	/**
	 * Select the first domain suggestion.
	 *
	 * @returns {string} Domain that was selected.
	 */
	async selectFirstSuggestion(): Promise< string > {
		const targetItem = this.page.getByRole( 'listitem' ).first();
		await targetItem.waitFor();

		const selectedDomain = await targetItem.getAttribute( 'title' );

		if ( ! selectedDomain ) {
			throw new Error( 'No domain found for first suggestion' );
		}

		const target = targetItem.getByRole( 'button', { name: 'Add to cart' } );
		await target.waitFor();

		await target.click();

		return selectedDomain;
	}

	/**
	 * Clicks the "Continue" button.
	 */
	async continue(): Promise< void > {
		const continueButton = await waitForElementEnabled( this.page, 'button:text("Continue")', {
			timeout: 30 * 1000,
		} );

		// Now click the enabled button using dispatchEvent to handle issues with the environment badge staying on top of the button.
		await Promise.all( [ continueButton.dispatchEvent( 'click' ), this.page.waitForNavigation() ] );
	}
}
