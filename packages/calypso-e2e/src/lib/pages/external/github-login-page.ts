import { Page } from 'playwright';

const selectors = {
	// General
	buttonContainingText: ( text: string ) => `button:has-text("${ text }")`,
	buttonWithExactText: ( text: string ) => `button:text-is("${ text }")`,

	// Inputs
	emailInput: 'input[id="login_field"]',
	passwordInput: 'input[id="password"]',
	otpInput: 'input[id="app_totp"]',

	// Button
	submitFormButton: 'input[type="submit"][name="commit"]',
	authorizeFormButton:
		'button#js-oauth-authorize-btn[type="submit"][name="authorize"]:not(:disabled)',
};

/**
 * Represents the login screens shown by GitHub.
 */
export class GitHubLoginPage {
	/**
	 * Construct and instance of the GitHubLoginPage.
	 *
	 * @param {Page} page Handler for instance of the Google login page.
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
		const locator = this.page.locator( selectors.buttonContainingText( text ) );
		await locator.click();
	}

	/**
	 * Clicks on a button with the **exact** text.
	 *
	 * @param {string} text Text on the button.
	 */
	async clickButtonWithExactText( text: string ): Promise< void > {
		const locator = this.page.locator( selectors.buttonWithExactText( text ) );
		await locator.click();
	}

	/**
	 * Fills the Apple ID username/email field.
	 *
	 * @param {string} email Username (Apple ID) of the user.
	 */
	async enterEmail( email: string ): Promise< void > {
		const locator = this.page.locator( selectors.emailInput );
		await locator.fill( email );
	}

	/**
	 * Fills the password field.
	 *
	 * @param {string} password Password of the user.
	 */
	async enterPassword( password: string ): Promise< void > {
		const locator = this.page.locator( selectors.passwordInput );
		await locator.type( password );
	}

	/**
	 * Clicks the submit button, e.g. for the login form.
	 */
	async clickSubmit(): Promise< void > {
		const buttonLocator = this.page.locator( selectors.submitFormButton );
		await buttonLocator.waitFor();
		await buttonLocator.click();
	}

	/**
	 * Clicks the authorize button, e.g. for the permissions form.
	 */
	async tryToClickAuthorize(): Promise< void > {
		const buttonLocator = this.page.locator( selectors.authorizeFormButton );
		await buttonLocator.waitFor( { timeout: 2000 } );
		await buttonLocator.click();
	}

	/* 2FA */

	/**
	 * Fills the 2FA code.
	 *
	 * @param {string} code 2FA code for the user.
	 */
	async enter2FACode( code: string ): Promise< void > {
		const locator = this.page.locator( selectors.otpInput ).first();
		await locator.type( code, { delay: 150 } );
	}
}
