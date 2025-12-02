import { Locator, Page } from 'playwright';
import { reloadAndRetry, waitForElementEnabled } from '../../element-helper';

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
	private container?: Locator;
	readonly claimYourSpaceHeading: Locator;
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page, container?: Locator ) {
		this.page = page;
		this.container = container;
		this.claimYourSpaceHeading = this.getContainer().getByRole( 'heading', {
			name: 'Claim your space on the web',
		} );
	}

	/**
	 * Gets the container locator.
	 *
	 * @returns {Locator} The container locator.
	 */
	private getContainer(): Page | Locator {
		return this.container ?? this.page;
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
	 * Clicks on the button to use a domain I already own
	 */
	async clickUseADomainIAlreadyOwn(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Use a domain I already own' } ).click();
	}

	/**
	 * Fills the "Use a domain I own" input and waits for the `is-available` response
	 *
	 * @param domainName Domain name to fill in the input
	 */
	async fillUseDomainIOwnInput( domainName: string ): Promise< void > {
		const searchAndPressEnter = async () => {
			const input = this.page.locator( '.use-my-domain__domain-input input' );
			await input.fill( domainName );
			await input.press( 'Enter' );
		};

		const [ response ] = await Promise.all( [
			this.page.waitForResponse( /is-available\?/ ),
			searchAndPressEnter(),
		] );

		if ( ! response ) {
			const errorText = await this.page.getByRole( 'status', { name: 'Notice' } ).innerText();
			throw new Error(
				`Encountered error while trying to check availability of domain.\nOriginal error: ${ errorText }`
			);
		}
	}

	/**
	 * Click on the "Transfer your domain" option in the "Transfer or Connect" page
	 */
	async selectTransferYourDomain(): Promise< void > {
		const button = this.getContainer()
			.locator( '.domain-transfer-or-connect__content button' )
			.nth( 0 );
		await button.waitFor();
		await button.click();
	}

	/**
	 * Click on the "Connect your domain" option in the "Transfer or Connect" page
	 */
	async selectConnectYourDomain(): Promise< void > {
		const button = await this.getContainer().getByRole( 'button', { name: 'Select' } ).nth( 1 );
		await button.waitFor();
		await button.click();
	}

	/**
	 * Click on the "Just buy a domain" option in the "Choose how to use your domain" page
	 */
	async selectJustBuyADomain(): Promise< void > {
		const button = await this.getContainer().getByRole( 'button', {
			name: /Just buy a domain.*/,
		} );
		await button.waitFor();
		await button.click();
	}

	/**
	 * Click on the "New site" option in the "Choose how to use your domain" page
	 */
	async selectNewSite(): Promise< void > {
		const button = await this.getContainer().getByRole( 'button', {
			name: /New site.*/,
		} );
		await button.waitFor();
		await button.click();
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
		const targetRow = this.getContainer().getByTitle( keyword );
		const suggestion = await this.selectSuggestion( targetRow );

		if ( ! suggestion ) {
			throw new Error( `No domain found for keyword: ${ keyword }` );
		}

		return suggestion;
	}

	/**
	 * Select the first domain suggestion.
	 *
	 * @param {boolean} waitForContinueButton Whether to wait for the continue button to be enabled.
	 * @returns {string} Domain that was selected.
	 */
	async selectFirstSuggestion( waitForContinueButton: boolean = true ): Promise< string > {
		const targetRow = this.getContainer().getByRole( 'listitem' ).first();
		const suggestion = await this.selectSuggestion( targetRow, waitForContinueButton );

		if ( ! suggestion ) {
			throw new Error( 'No domain found for first suggestion' );
		}

		return suggestion;
	}

	/**
	 * Select a domain suggestion.
	 *
	 * @param {Locator} row The row to select.
	 * @param {boolean} waitForContinueButton Whether to wait for the continue button to be enabled.
	 * @returns {string | null} Domain that was selected.
	 */
	private async selectSuggestion(
		row: Locator,
		waitForContinueButton: boolean = true
	): Promise< string | null > {
		await row.waitFor();

		const selectedDomain = await row.getAttribute( 'title' );

		if ( ! selectedDomain ) {
			return null;
		}

		const addToCartButton = row.getByRole( 'button', { name: 'Add to cart' } );
		await addToCartButton.waitFor();

		await addToCartButton.click();
		await addToCartButton.waitFor( { state: 'detached', timeout: 30000 } );

		if ( waitForContinueButton ) {
			const continueButton = row.getByRole( 'button', { name: 'Continue' } );
			await continueButton.waitFor();
		}

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

	/**
	 * Skips the domain search screen.
	 */
	async skipPurchase(): Promise< string > {
		const button = this.page.getByRole( 'button', { name: 'Skip purchase' } );

		await button.waitFor();

		let domain = await button.getAttribute( 'aria-label' );
		domain = domain?.replace( 'Skip purchase and continue with ', '' ) ?? null;

		if ( ! domain ) {
			throw new Error( 'No domain found for skip purchase button' );
		}

		await button.click();

		return domain;
	}
}
