import { Page } from 'playwright';

const selectors = {
	accountClosedMessage: ':text("Your account has been deleted")',
};

/**
 * Represents the Me > Account Settings page.
 */
export class AccountClosedPage {
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
	 * Confirms the account closure message and submessages are shown.
	 */
	async confirmAccountClosed(): Promise< void > {
		await this.page.waitForSelector( selectors.accountClosedMessage );
	}
}
