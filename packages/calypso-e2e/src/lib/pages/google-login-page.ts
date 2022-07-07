import { Page, Locator } from 'playwright';

const selectors = {
	// Generic
	button: ( text: string ) => `button[type="button"]:has-text("${ text }")`,

	emailInput: 'input[type="email"]',
	passwordInput: 'input[type="password"]',
	phoneInput: 'input[type="tel"][id="phoneNumberId"]',
	otpInput: 'input[type="tel"][id="idvAnyPhonePin"],input[type="tel"][id="totpPin"]', // Match on both SMS OTP and TOTP inputs.
};

/**
 * Represents the login screens shown by Google.
 */
export class GoogleLoginPage {
	/**
	 * Construct and instance of the EmailClient.
	 *
	 * @param {Page} page Handler for instance of the Google login page.
	 */
	constructor( private page: Page ) {}

	/**
	 * Waits until the target locator is stable.
	 *
	 * After clicking the "Next" button on the Google login form,
	 * sliding animations are played. This can interfere with the
	 * ability for Playwright to successfully interact with the
	 * target locator.
	 */
	private async waitUntilStable( locator: Locator ) {
		const elementHandle = await locator.elementHandle();
		await Promise.all( [
			locator.waitFor( { state: 'visible' } ),
			elementHandle?.waitForElementState( 'stable' ),
		] );
	}

	/**
	 * Fills the username field.
	 *
	 * Note that to avoid bot detection where possible, the
	 * method used is `type`, not `fill`.
	 *
	 * @param {string} email Email address of the user.
	 */
	async enterUsername( email: string ): Promise< void > {
		const locator = this.page.locator( selectors.emailInput );
		await locator.waitFor( { state: 'visible' } );

		await locator.type( email, { delay: 50 } );
	}

	/**
	 * Fills the password field.
	 *
	 * Note that to avoid bot detection where possible, the
	 * method used is `type`, not `fill`.
	 *
	 * @param {string} password Password of the user.
	 */
	async enterPassword( password: string ): Promise< void > {
		const locator = this.page.locator( selectors.passwordInput );

		await this.waitUntilStable( locator );

		await locator.type( password, { delay: 50 } );
	}

	/**
	 * Determines if a 2FA challenge is shown.
	 *
	 * @returns {boolean} True if the 2FA input is shown. False otherwise.
	 */
	async isChallengeShown(): Promise< boolean > {
		const locator = this.page.locator( selectors.phoneInput );

		return Boolean( await locator.count() );
	}

	/**
	 * Fills the phone number field for the 2FA.
	 *
	 * @param {string} phoneNumber Phone number of the user.
	 */
	async enter2FAPhoneNumber( phoneNumber: string ): Promise< void > {
		const locator = this.page.locator( selectors.phoneInput );

		await this.waitUntilStable( locator );

		await locator.type( phoneNumber );
	}

	/**
	 * Fills the 2FA code.
	 *
	 * @param {string} code 2FA code for the user, either TOTP or SMS OTP.
	 */
	async enter2FACode( code: string ): Promise< void > {
		const locator = this.page.locator( selectors.otpInput );

		await this.waitUntilStable( locator );

		await locator.type( code );
	}

	/**
	 * Given text, clicks the button with matching text.
	 *
	 * @param {string} text Text on button to click.
	 */
	async clickButton( text: string ): Promise< void > {
		const locator = this.page.locator( selectors.button( text ) );
		await locator.click();
	}
}
