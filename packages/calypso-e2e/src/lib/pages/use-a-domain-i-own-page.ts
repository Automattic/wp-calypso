import { Page } from 'playwright';

const selectors = {
	ownedDomainInput: '.use-my-domain__domain-input-fieldset input',
	continueButton: 'button:text("Continue")',
	connectDomainButton: '.domain-transfer-or-connect__content button:nth-child(2)',
	transferDomainButton: '.domain-transfer-or-connect__content button:nth-child(1)',
};

/**
 * Page representing the page to search for and take action on connecting or transferring an already owned domain
 */
export class UseADomainIOwnPage {
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
}
