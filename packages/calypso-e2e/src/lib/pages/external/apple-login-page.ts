import { Page } from 'playwright';

const selectors = {
	// General
	buttonWithText: ( text: string ) => `button:text("${ text }")`,

	// Inputs
	emailInput: 'input[id="account_name_text_field"]',
	passwordInput: 'input[id="password_text_field"]',
	otpInput:
		'input[aria-label="Enter verification code. After entering the verification code, the page gets updated automatically. Digit 1"]',
};

/**
 * Represents the login screens shown by Apple.
 */
export class AppleLoginPage {
	/**
	 * Construct and instance of the EmailClient.
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
	 * Clicks on a button with text.
	 *
	 * @param {string} text Text on the button.
	 */
	async clickButtonWithText( text: string ): Promise< void > {
		const locator = this.page.locator( selectors.buttonWithText( text ) );
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

		const buttonLocator = this.page.locator(
			'button[aria-label="Continue"][aria-disabled="false"]'
		);
		await buttonLocator.waitFor();
	}

	/**
	 * Fills the password field.
	 *
	 * @param {string} password Password of the user.
	 */
	async enterPassword( password: string ): Promise< void > {
		const locator = this.page.locator( selectors.passwordInput );
		await locator.type( password );

		const buttonLocator = this.page.locator(
			'button[aria-label="Sign In"][aria-disabled="false"]'
		);
		await buttonLocator.waitFor();
	}

	/* 2FA */

	/**
	 * Fills the 2FA code.
	 *
	 * @param {string} code 2FA code for the user.
	 */
	async enter2FACode( code: string ): Promise< void > {
		const locator = this.page.locator( selectors.otpInput );
		await locator.type( code, { delay: 500 } );
	}
}
