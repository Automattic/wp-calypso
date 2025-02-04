import { Page, Locator } from 'playwright';

const selectors = {
	passwordInput: 'input[type="password"]',
	phoneInput: 'input[type="tel"][id="phoneNumberId"]',
	otpInput: 'input[type="tel"][id="idvAnyPhonePin"],input[type="tel"][id="totpPin"]', // Match on both SMS OTP and TOTP inputs.
};

/**
 * Represents the login screens shown by Google.
 */
export class GoogleLoginPage {
	/**
	 * Construct and instance of the GoogleLoginPage.
	 *
	 * @param {Page} page Page object.
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
		// Locators do not yet implement a "stable" wait,
		// so we must use the ElementHandle.
		const elementHandle = await locator.elementHandle();
		await Promise.all( [
			locator.first().waitFor( { state: 'visible' } ),
			elementHandle?.waitForElementState( 'stable' ),
		] );
	}

	/**
	 * Given text, clicks the button with matching text.
	 *
	 * @param {string} text Text on button to click.
	 */
	async clickButton( text: string ) {
		const locator = this.page.getByRole( 'button', { name: new RegExp( text ) } );
		await this.waitUntilStable( locator );
		await locator.click();
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
		const locator = this.page.getByRole( 'textbox', { name: 'Email or phone' } );
		await this.waitUntilStable( locator );

		await locator.type( email, { delay: 30 } );
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
		const locator = this.page.getByRole( 'textbox', { name: 'Enter your password' } );

		await this.waitUntilStable( locator );

		await locator.type( password, { delay: 30 } );
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
		const locator = this.page.getByRole( 'textbox', { name: 'Enter code' } );

		await this.waitUntilStable( locator );
		await locator.first().type( code, { delay: 30 } );
	}

	/**
	 * Checks if the given text is present and stable on the page.
	 *
	 * @param {string} selector The selector to check for.
	 * @returns {Promise<boolean>} A promise that resolves to true if the text is present and stable, otherwise false.
	 */
	async isVisible( selector: string ): Promise< boolean > {
		const locator = this.page.locator( selector );
		try {
			await this.waitUntilStable( locator );
			const isVisible = await locator.isVisible();
			return isVisible;
		} catch ( error ) {
			console.error( `Error checking for selector "${ selector }":`, error );
			return false;
		}
	}
}
