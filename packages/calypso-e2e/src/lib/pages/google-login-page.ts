import { Page } from 'playwright';

const selectors = {
	// Generic
	button: ( text: string ) => `button[type="button"]:has-text("${ text }")`,

	emailInput: 'input[type="email"]',
	passwordInput: 'input[type="password"]',
	phoneInput: 'input[type="tel"][id="phoneNumberId"]',
	otpInput: 'input[type="tel"][id="id="idvAnyPhonePin"]',
};

/**
 *
 */
export class GoogleLoginPage {
	/**
	 *
	 * @param page
	 */
	constructor( private page: Page ) {}

	/**
	 *
	 * @param email
	 */
	async enterUsername( email: string ): Promise< void > {
		const locator = this.page.locator( selectors.emailInput );
		await locator.waitFor( { state: 'visible' } );

		await locator.type( email );
	}

	/**
	 *
	 * @param password
	 */
	async enterPassword( password: string ): Promise< void > {
		const locator = this.page.locator( selectors.passwordInput );

		const elementHandle = await locator.elementHandle();
		await Promise.all( [
			locator.waitFor( { state: 'visible' } ),
			elementHandle?.waitForElementState( 'stable' ),
		] );

		await locator.type( password );
	}

	/**
	 *
	 */
	async isChallengeShown(): Promise< boolean > {
		const locator = this.page.locator( selectors.phoneInput );

		return Boolean( await locator.count() );
	}

	/**
	 *
	 */
	async enter2FAPhoneNumber( phoneNumber: string ): Promise< void > {
		const locator = this.page.locator( selectors.phoneInput );
		const elementHandle = await locator.elementHandle();

		await Promise.all( [
			locator.waitFor( { state: 'visible' } ),
			elementHandle?.waitForElementState( 'stable' ),
		] );

		await locator.type( phoneNumber );
	}

	/**
	 *
	 * @param code
	 */
	async enter2FACode( code: string ): Promise< void > {
		const locator = this.page.locator( selectors.otpInput );
		const elementHandle = await locator.elementHandle();

		await Promise.all( [
			locator.waitFor( { state: 'visible' } ),
			elementHandle?.waitForElementState( 'stable' ),
		] );

		await locator.type( code );
	}

	/**
	 *
	 * @param text
	 */
	async clickButton( text: string ): Promise< void > {
		const locator = this.page.locator( selectors.button( text ) );
		await locator.click();
	}
}
