import { Locator, Page } from 'playwright';

const selectors = {
	ownedDomainInput: '.use-my-domain__domain-input-fieldset input',
	continueButton: 'button:text("Continue")',
	connectDomainButton: 'button span:text("Connect your site address")',
	transferDomainButton: 'button span:text("Transfer your domain name")',
};

/**
 * Page representing the page to search for and take action on connecting or transferring an already owned domain
 */
export class UseADomainIOwnPage {
	private page: Page;
	private container?: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {Locator} container The container locator.
	 */
	constructor( page: Page, container?: Locator ) {
		this.page = page;
		this.container = container;
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
	 * Search for a domain name you already own and select it
	 *
	 * @param domainName The owned domain name to search for and select
	 */
	async search( domainName: string ): Promise< void > {
		await this.page.fill( selectors.ownedDomainInput, domainName );
		await this.clickContinue();
	}

	/**
	 * Clicks on the button to continue
	 */
	async clickContinue(): Promise< void > {
		await this.page.click( selectors.continueButton );
	}

	/**
	 * Validates that the button to connect/map your selected domain is present and enabled
	 */
	async validateButtonToConnectDomain(): Promise< void > {
		const elementHandle = await this.page.waitForSelector( selectors.connectDomainButton );
		await elementHandle.waitForElementState( 'enabled' );
	}

	/**
	 * Clicks on the button to connect/map your selected domain
	 */
	async clickButtonToConnectDomain(): Promise< void > {
		await this.page.click( selectors.connectDomainButton );
	}

	/**
	 * Validates that the button to transfer your selected domain is present and enabled
	 */
	async validateButtonToTransferDomain(): Promise< void > {
		const elementHandle = await this.page.waitForSelector( selectors.transferDomainButton );
		await elementHandle.waitForElementState( 'enabled' );
	}

	/**
	 * Clicks on the button to transfer your selected domain
	 */
	async clickButtonToTransferDomain(): Promise< void > {
		await this.page.click( selectors.transferDomainButton );
	}

	/**
	 * Gets the value of the "Use a domain I own" input
	 * @returns the value of the input
	 */
	async getDomainInputValue(): Promise< string > {
		return this.getContainer().locator( '.use-my-domain__domain-input input' ).inputValue();
	}

	/**
	 * Fills the "Use a domain I own" input and waits for the `is-available` response
	 *
	 * @param domainName Domain name to fill in the input
	 */
	async fillUseDomainIOwnInput( domainName: string ): Promise< void > {
		const searchAndPressEnter = async () => {
			const input = this.getContainer().locator( '.use-my-domain__domain-input input' );
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
		const button = this.getContainer().getByRole( 'button', { name: 'Select' } ).nth( 1 );
		await button.waitFor();
		await button.click();
	}
}
