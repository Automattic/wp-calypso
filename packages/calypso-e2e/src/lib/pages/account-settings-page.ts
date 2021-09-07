import { Page } from 'playwright';

const selectors = {
	// Close account
	closeAccountLink: `p:text("Close your account permanently")`,
	closeAccountButton: `button:text("Close account")`,

	// Modal
	modalContinueButton: `button:text("Continue")`,
	usernameSpan: `span.account-close__confirm-dialog-target-username`,
	usernameConfirmationInput: `input[id="confirmAccountCloseInput"]`,
	modalCloseAccountButton: `button:text("Close your account")`,
};

/**
 * Represents the Me > Account Settings page.
 */
export class AccountSettingsPage {
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
	 * Closes the currently logged in user's account.
	 */
	async closeAccount(): Promise< void > {
		await this.page.click( selectors.closeAccountLink );
		await this.page.click( selectors.closeAccountLink );
		await this.page.click( selectors.modalContinueButton );
		const username = await this.page
			.waitForSelector( selectors.usernameSpan )
			.then( ( element ) => element.innerText() );
		await this.page.fill( selectors.usernameConfirmationInput, username );
		await this.page.click( selectors.modalCloseAccountButton );
	}
}
