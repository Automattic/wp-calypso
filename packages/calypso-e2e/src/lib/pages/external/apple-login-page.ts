import { Page } from 'playwright';

const selectors = {
	// General
	buttonContainingText: ( text: string ) => `button:has-text("${ text }")`,
	buttonWithExactText: ( text: string ) => `button:text-is("${ text }")`,

	// Inputs
	emailInput: 'input[id="account_name_text_field"]',
	passwordInput: 'input[id="password_text_field"]',
	otpInput: 'input.form-security-code-input', // Matches OTP input fields

	// Button
	continueButton: 'button[aria-label="Continue"][aria-disabled="false"]',
	submitFormButton: 'button[aria-label="Sign In"][aria-disabled="false"]',
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
	 * Checks if a button with the exact text exists and is visible.
	 *
	 * @param {string} text Text on the button.
	 * @returns {Promise<boolean>} True if the button exists and is visible.
	 */
	async hasButtonWithExactText( text: string ): Promise< boolean > {
		const locator = this.page.locator( selectors.buttonWithExactText( text ) );
		return await locator.isVisible();
	}

	/**
	 * Fills the Apple ID username/email field.
	 *
	 * @param {string} email Username (Apple ID) of the user.
	 */
	async enterEmail( email: string ): Promise< void > {
		const locator = this.page.locator( selectors.emailInput );
		await locator.fill( email );

		// Wait for the button to no longer be marked "disabled".
		const buttonLocator = this.page.locator( selectors.continueButton );
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

		// Wait for the button to no longer be marked "disabled".
		const buttonLocator = this.page.locator( selectors.submitFormButton );
		await buttonLocator.waitFor();
	}

	/* 2FA */

	/**
	 * Fills the 2FA code.
	 *
	 * @param {string} code 2FA code for the user.
	 */
	async enter2FACode( code: string ): Promise< void > {
		const firstInput = this.page.locator( selectors.otpInput ).first();
		await firstInput.focus();
		await this.page.keyboard.insertText( code );
	}

	/**
	 * Checks if the rate limit message is visible.
	 *
	 * @returns {Promise<boolean>} True if the rate limit message is visible.
	 */
	async hasRateLimitMessage(): Promise< boolean > {
		try {
			// Look for the exact error message with proper error handling
			const element = this.page.locator(
				'.form-message:has-text("Verification codes can\'t be sent to this phone number at this time. Please try again later.")'
			);

			// Wait a short time for the message to be visible
			await element.waitFor( { state: 'visible', timeout: 1000 } ).catch( () => {} );

			// Check if it's visible
			return await element.isVisible();
		} catch ( error ) {
			console.log( 'Error while checking for rate limit message:', error );
			return false;
		}
	}
}
