import { Page } from 'playwright';

const selectors = {
	// Generic
	button: ( text: string ) => `button[type="button"]:has-text("${ text }")`,

	emailInput: 'input[type="email"]',
	passwordInput: 'input[type="password"]',
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
	 * @param param0
	 * @param param0.email
	 * @param param0.password
	 */
	async enterCredentials( {
		email,
		password,
	}: {
		email: string;
		password: string;
	} ): Promise< void > {
		await this.enterEmail( email );
		await this.clickButton( 'Next' );
		await this.enterPassword( password );
	}

	/**
	 *
	 * @param email
	 */
	async enterEmail( email: string ): Promise< void > {
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
		await locator.waitFor( { state: 'visible' } );
		await locator.type( password );
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
