import { Page } from 'playwright';

/**
 * Represents the login screens shown by GitHub.
 */
export class GitHubLoginPage {
	/**
	 * Construct and instance of the EmailClient.
	 *
	 * @param {Page} page Handler for instance of the GitHub login page.
	 */
	constructor( private page: Page ) {}

	/**
	 * Press enter to proceed to the next login step.
	 */
	async pressEnter(): Promise< void > {
		await this.page.keyboard.press( 'Enter' );
	}

	/**
	 * Clicks on a button containing a string of text.
	 *
	 * @param {string} text Text on the button.
	 */
	async clickButtonContainingText( text: string ): Promise< void > {
		await this.page.getByRole( 'button', { name: new RegExp( text, 'i' ) } ).click();
	}

	/**
	 * Clicks on a button with the **exact** text.
	 *
	 * @param {string} text Text on the button.
	 */
	async clickButtonWithExactText( text: string ): Promise< void > {
		await this.page.getByRole( 'button', { name: text, exact: true } ).click();
	}

	/**
	 * Checks if a button with the exact text exists and is visible.
	 *
	 * @param {string} text Text on the button.
	 * @returns {Promise<boolean>} True if the button exists and is visible.
	 */
	async hasButtonWithExactText( text: string ): Promise< boolean > {
		return await this.page.getByRole( 'button', { name: text, exact: true } ).isVisible();
	}

	/**
	 * Fills the GitHub username/email field.
	 *
	 * @param {string} email Username (GitHub) of the user.
	 */
	async enterEmail( email: string ): Promise< void > {
		await this.page.getByRole( 'textbox', { name: /username|login/i } ).fill( email );

		// Wait for the password field to be visible
		await this.page.getByRole( 'textbox', { name: /password/i } ).waitFor();
	}

	/**
	 * Fills the password field.
	 *
	 * @param {string} password Password of the user.
	 */
	async enterPassword( password: string ): Promise< void > {
		await this.page.getByRole( 'textbox', { name: /password/i } ).fill( password );
	}

	/**
	 * Fills the 2FA code field.
	 *
	 * @param {string} code 2FA code of the user.
	 */
	async enter2FACode( code: string ): Promise< void > {
		await this.page.getByRole( 'textbox', { name: /code/i } ).fill( code );
	}
}
